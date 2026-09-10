"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { EstadoCita } from "@/generated/prisma/enums";

export async function crearCita(formData: FormData) {
  const pacienteId = String(formData.get("pacienteId") ?? "");
  const fecha = String(formData.get("fecha") ?? "");
  const motivo = String(formData.get("motivo") ?? "").trim();

  if (!pacienteId || !fecha) {
    throw new Error("Paciente y fecha son obligatorios");
  }

  await prisma.cita.create({
    data: {
      pacienteId,
      fecha: new Date(fecha),
      motivo: motivo || null,
    },
  });

  revalidatePath("/agenda");
}

export async function cambiarEstadoCita(citaId: string, estado: EstadoCita) {
  await prisma.cita.update({
    where: { id: citaId },
    data: { estado },
  });
  revalidatePath("/agenda");
}
