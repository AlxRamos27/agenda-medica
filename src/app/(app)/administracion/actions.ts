"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { MetodoPago } from "@/generated/prisma/enums";

export async function crearVenta(formData: FormData) {
  const pacienteId = String(formData.get("pacienteId") ?? "").trim();
  const concepto = String(formData.get("concepto") ?? "").trim();
  const monto = Number(formData.get("monto"));
  const metodoPago = String(formData.get("metodoPago") ?? "PAGO_MOVIL") as MetodoPago;

  if (!concepto || !Number.isFinite(monto) || monto <= 0) {
    throw new Error("Concepto y monto válido son obligatorios");
  }

  await prisma.venta.create({
    data: {
      concepto,
      monto,
      metodoPago,
      pacienteId: pacienteId || null,
    },
  });

  revalidatePath("/administracion");
}

export async function crearCompra(formData: FormData) {
  const concepto = String(formData.get("concepto") ?? "").trim();
  const monto = Number(formData.get("monto"));
  const proveedor = String(formData.get("proveedor") ?? "").trim();

  if (!concepto || !Number.isFinite(monto) || monto <= 0) {
    throw new Error("Concepto y monto válido son obligatorios");
  }

  await prisma.compra.create({
    data: { concepto, monto, proveedor: proveedor || null },
  });

  revalidatePath("/administracion");
}

export async function crearGasto(formData: FormData) {
  const concepto = String(formData.get("concepto") ?? "").trim();
  const monto = Number(formData.get("monto"));
  const categoria = String(formData.get("categoria") ?? "").trim();

  if (!concepto || !Number.isFinite(monto) || monto <= 0) {
    throw new Error("Concepto y monto válido son obligatorios");
  }

  await prisma.gasto.create({
    data: { concepto, monto, categoria: categoria || null },
  });

  revalidatePath("/administracion");
}
