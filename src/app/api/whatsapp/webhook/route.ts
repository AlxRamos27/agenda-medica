import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { crearSolicitudCita } from "@/lib/citas";
import {
  SLOT_OTRO_HORARIO,
  enviarListaHorarios,
  enviarTexto,
  generarSlotsDisponibles,
} from "@/lib/whatsapp";

// --- Verificación del webhook (Meta hace un GET al configurar la URL) ---

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get("hub.mode");
  const token = params.get("hub.verify_token");
  const challenge = params.get("hub.challenge");

  if (mode === "subscribe" && token && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge ?? "", { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

// --- Mensajes entrantes ---

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  if (!firmaValida(rawBody, request.headers.get("x-hub-signature-256"))) {
    return new NextResponse("Firma inválida", { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ ok: true });
  }

  const mensaje = extraerMensaje(payload);
  if (mensaje) {
    await procesarMensaje(mensaje);
  }

  return NextResponse.json({ ok: true });
}

function firmaValida(rawBody: string, header: string | null): boolean {
  const secret = process.env.WHATSAPP_APP_SECRET;
  if (!secret || !header) return false;

  const esperado = "sha256=" + createHmac("sha256", secret).update(rawBody).digest("hex");
  const recibido = Buffer.from(header);
  const esperadoBuf = Buffer.from(esperado);

  if (recibido.length !== esperadoBuf.length) return false;
  return timingSafeEqual(recibido, esperadoBuf);
}

type MensajeEntrante = {
  from: string;
  texto?: string;
  listReplyId?: string;
};

function extraerMensaje(payload: unknown): MensajeEntrante | null {
  const entry = getPath(payload, ["entry", 0]);
  const value = getPath(entry, ["changes", 0, "value"]);
  const mensaje = getPath(value, ["messages", 0]);
  if (!mensaje || typeof mensaje !== "object") return null;

  const m = mensaje as Record<string, unknown>;
  const from = m.from;
  if (typeof from !== "string") return null;

  if (m.type === "text") {
    const texto = getPath(m, ["text", "body"]);
    return { from, texto: typeof texto === "string" ? texto : undefined };
  }

  if (m.type === "interactive") {
    const interactiveType = getPath(m, ["interactive", "type"]);
    if (interactiveType === "list_reply") {
      const id = getPath(m, ["interactive", "list_reply", "id"]);
      return { from, listReplyId: typeof id === "string" ? id : undefined };
    }
  }

  return { from };
}

function getPath(obj: unknown, path: (string | number)[]): unknown {
  let current: unknown = obj;
  for (const key of path) {
    if (current == null || typeof current !== "object") return undefined;
    current = (current as Record<string | number, unknown>)[key];
  }
  return current;
}

async function procesarMensaje(msg: MensajeEntrante) {
  const telefono = msg.from;
  const conversacion = await prisma.conversacionWhatsApp.findUnique({ where: { telefono } });

  if (!conversacion) {
    await prisma.conversacionWhatsApp.create({ data: { telefono } });
    await enviarListaHorarios(telefono, generarSlotsDisponibles());
    return;
  }

  switch (conversacion.paso) {
    case "ELIGIENDO_HORARIO": {
      if (!msg.listReplyId) {
        await enviarTexto(telefono, "Por favor elige una opción de la lista de horarios que te enviamos arriba.");
        return;
      }

      if (msg.listReplyId === SLOT_OTRO_HORARIO) {
        await prisma.conversacionWhatsApp.update({
          where: { telefono },
          data: { paso: "PIDIENDO_NOMBRE", fechaElegida: null },
        });
        await enviarTexto(
          telefono,
          "Sin problema, te contactaremos para coordinar el horario. ¿Cuál es tu nombre y apellido completo?"
        );
        return;
      }

      const slot = generarSlotsDisponibles().find((s) => s.id === msg.listReplyId);
      if (!slot) {
        await prisma.conversacionWhatsApp.delete({ where: { telefono } });
        await enviarTexto(telefono, "Esa opción ya no es válida. Escríbenos de nuevo para ver los horarios actualizados.");
        return;
      }

      await prisma.conversacionWhatsApp.update({
        where: { telefono },
        data: { paso: "PIDIENDO_NOMBRE", fechaElegida: slot.fecha },
      });
      await enviarTexto(telefono, `Elegiste ${slot.etiqueta}. ¿Cuál es tu nombre y apellido completo?`);
      return;
    }

    case "PIDIENDO_NOMBRE": {
      const nombreCompleto = msg.texto?.trim();
      if (!nombreCompleto) {
        await enviarTexto(telefono, "Por favor escribe tu nombre y apellido completo.");
        return;
      }

      await prisma.conversacionWhatsApp.update({
        where: { telefono },
        data: { paso: "PIDIENDO_MOTIVO", nombreCompleto },
      });
      await enviarTexto(telefono, "¿Cuál es el motivo de la consulta? (Escribe \"omitir\" si prefieres no decirlo)");
      return;
    }

    case "PIDIENDO_MOTIVO": {
      const motivoTexto = msg.texto?.trim() ?? "";
      const motivo = motivoTexto.toLowerCase() === "omitir" ? null : motivoTexto || null;

      const partes = (conversacion.nombreCompleto ?? "").trim().split(/\s+/).filter(Boolean);
      const nombre = partes[0] || "Paciente";
      const apellido = partes.slice(1).join(" ") || nombre;

      const fecha = conversacion.fechaElegida ?? generarSlotsDisponibles(1)[0].fecha;

      await crearSolicitudCita({ nombre, apellido, telefono, fecha, motivo });
      await prisma.conversacionWhatsApp.delete({ where: { telefono } });

      await enviarTexto(
        telefono,
        conversacion.fechaElegida
          ? "¡Listo! Recibimos tu solicitud de cita. Te contactaremos para confirmarla."
          : "¡Listo! Recibimos tu solicitud. Te contactaremos para coordinar el horario."
      );
      return;
    }
  }
}
