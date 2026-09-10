"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { Severidad } from "@/generated/prisma/enums";

export async function crearPaciente(formData: FormData) {
  const nombre = String(formData.get("nombre") ?? "").trim();
  const apellido = String(formData.get("apellido") ?? "").trim();
  const cedula = String(formData.get("cedula") ?? "").trim();
  const telefono = String(formData.get("telefono") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!nombre || !apellido) {
    throw new Error("Nombre y apellido son obligatorios");
  }

  await prisma.paciente.create({
    data: {
      nombre,
      apellido,
      cedula: cedula || null,
      telefono: telefono || null,
      email: email || null,
    },
  });

  revalidatePath("/pacientes");
}

export async function agregarAlergia(pacienteId: string, formData: FormData) {
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const severidad = String(formData.get("severidad") ?? "MODERADA") as Severidad;

  if (!descripcion) return;

  await prisma.alergia.create({
    data: { pacienteId, descripcion, severidad },
  });

  revalidatePath(`/pacientes/${pacienteId}`);
}

export async function agregarRegistroHistorial(
  pacienteId: string,
  formData: FormData
) {
  const motivoConsulta = String(formData.get("motivoConsulta") ?? "").trim();
  const diagnostico = String(formData.get("diagnostico") ?? "").trim();
  const tratamiento = String(formData.get("tratamiento") ?? "").trim();
  const notas = String(formData.get("notas") ?? "").trim();

  if (!motivoConsulta) {
    throw new Error("El motivo de consulta es obligatorio");
  }

  await prisma.registroHistorial.create({
    data: {
      pacienteId,
      motivoConsulta,
      diagnostico: diagnostico || null,
      tratamiento: tratamiento || null,
      notas: notas || null,
    },
  });

  revalidatePath(`/pacientes/${pacienteId}`);
}
