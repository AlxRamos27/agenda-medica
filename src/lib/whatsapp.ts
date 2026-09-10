const GRAPH_API_VERSION = "v21.0";

function graphUrl() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!phoneNumberId) {
    throw new Error("Falta WHATSAPP_PHONE_NUMBER_ID en las variables de entorno");
  }
  return `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`;
}

async function enviarMensaje(payload: Record<string, unknown>) {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) {
    throw new Error("Falta WHATSAPP_ACCESS_TOKEN en las variables de entorno");
  }

  const res = await fetch(graphUrl(), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", ...payload }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Error enviando mensaje de WhatsApp (${res.status}): ${body}`);
  }
}

export async function enviarTexto(to: string, texto: string) {
  await enviarMensaje({
    to,
    type: "text",
    text: { body: texto },
  });
}

export type SlotHorario = {
  id: string;
  fecha: Date;
  etiqueta: string;
};

const DIAS_SEMANA = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];
const HORAS_DISPONIBLES = [9, 11, 14, 16];

/**
 * Genera horarios de ejemplo para los próximos días hábiles, sin chequear
 * conflictos con citas ya agendadas (MVP — el médico confirma/reagenda
 * manualmente desde la Agenda si hace falta).
 */
export function generarSlotsDisponibles(cantidad = 6): SlotHorario[] {
  const slots: SlotHorario[] = [];
  const cursor = new Date();
  cursor.setMinutes(0, 0, 0);
  cursor.setDate(cursor.getDate() + 1);

  while (slots.length < cantidad) {
    const esFinDeSemana = cursor.getDay() === 0 || cursor.getDay() === 6;
    if (!esFinDeSemana) {
      for (const hora of HORAS_DISPONIBLES) {
        if (slots.length >= cantidad) break;
        const fecha = new Date(cursor);
        fecha.setHours(hora, 0, 0, 0);
        const etiqueta = `${DIAS_SEMANA[fecha.getDay()]} ${fecha.getDate()}/${fecha.getMonth() + 1} - ${hora}:00`;
        slots.push({ id: `slot-${slots.length}`, fecha, etiqueta });
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return slots;
}

export const SLOT_OTRO_HORARIO = "otro-horario";

export async function enviarListaHorarios(to: string, slots: SlotHorario[]) {
  await enviarMensaje({
    to,
    type: "interactive",
    interactive: {
      type: "list",
      header: { type: "text", text: "Agenda tu cita" },
      body: { text: "Elige el horario que prefieras. Luego confirmaremos contigo." },
      action: {
        button: "Ver horarios",
        sections: [
          {
            title: "Horarios disponibles",
            rows: [
              ...slots.map((s) => ({ id: s.id, title: s.etiqueta })),
              { id: SLOT_OTRO_HORARIO, title: "Otro horario", description: "Te contactamos para coordinar" },
            ],
          },
        ],
      },
    },
  });
}
