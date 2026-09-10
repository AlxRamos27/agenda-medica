"use server";

import { revalidatePath } from "next/cache";
import { crearSolicitudCita } from "@/lib/citas";

const TIEMPO_MINIMO_MS = 2000;

export type SolicitarCitaState = {
  ok: boolean;
  error: string | null;
};

export async function solicitarCita(
  _prevState: SolicitarCitaState,
  formData: FormData
): Promise<SolicitarCitaState> {
  // Honeypot: los bots suelen rellenar todos los campos, incluido este,
  // que un usuario real nunca ve (oculto por CSS).
  const honeypot = String(formData.get("sitio_web") ?? "").trim();
  if (honeypot) {
    return { ok: true, error: null };
  }

  const cargadoEn = Number(formData.get("cargadoEn") ?? 0);
  if (!cargadoEn || Date.now() - cargadoEn < TIEMPO_MINIMO_MS) {
    return { ok: true, error: null };
  }

  const nombre = String(formData.get("nombre") ?? "").trim();
  const apellido = String(formData.get("apellido") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const cedula = String(formData.get("cedula") ?? "").trim();
  const fecha = String(formData.get("fecha") ?? "").trim();
  const motivo = String(formData.get("motivo") ?? "").trim();

  if (!nombre || !apellido || !telefono || !fecha) {
    return { ok: false, error: "Nombre, apellido, teléfono y fecha son obligatorios." };
  }

  const fechaDate = new Date(fecha);
  if (Number.isNaN(fechaDate.getTime())) {
    return { ok: false, error: "La fecha indicada no es válida." };
  }

  await crearSolicitudCita({
    nombre,
    apellido,
    telefono,
    cedula: cedula || null,
    fecha: fechaDate,
    motivo: motivo || null,
  });

  revalidatePath("/agenda");

  return { ok: true, error: null };
}
