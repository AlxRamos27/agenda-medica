"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function generarFactura(ventaId: string) {
  const correlativo = (await prisma.factura.count()) + 1;
  const numero = `FAC-${String(correlativo).padStart(6, "0")}`;

  await prisma.factura.create({
    data: { ventaId, numero },
  });

  revalidatePath("/facturacion");
}
