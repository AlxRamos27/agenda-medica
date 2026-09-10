import { prisma } from "@/lib/prisma";

export type SolicitudCitaInput = {
  nombre: string;
  apellido: string;
  telefono: string;
  cedula?: string | null;
  fecha: Date;
  motivo?: string | null;
};

/**
 * Busca un paciente existente (por cédula si viene, si no por
 * teléfono+nombre+apellido) o crea uno nuevo, y agenda una cita
 * PENDIENTE para él. Usado tanto por el formulario público /reservar
 * como por el bot de WhatsApp, para no duplicar pacientes cuando la
 * misma persona agenda por más de un canal.
 */
export async function crearSolicitudCita(input: SolicitudCitaInput) {
  const { nombre, apellido, telefono, cedula, fecha, motivo } = input;

  let paciente = cedula
    ? await prisma.paciente.findUnique({ where: { cedula } })
    : await prisma.paciente.findFirst({ where: { telefono, nombre, apellido } });

  if (!paciente) {
    paciente = await prisma.paciente.create({
      data: {
        nombre,
        apellido,
        telefono: telefono || null,
        cedula: cedula || null,
      },
    });
  }

  const cita = await prisma.cita.create({
    data: {
      pacienteId: paciente.id,
      fecha,
      motivo: motivo || null,
    },
  });

  return { paciente, cita };
}
