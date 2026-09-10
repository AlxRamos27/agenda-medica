import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ImprimirBoton } from "./imprimir-boton";

export const dynamic = "force-dynamic";

export default async function FacturaDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const factura = await prisma.factura.findUnique({
    where: { id },
    include: { venta: { include: { paciente: true } } },
  });

  if (!factura) notFound();

  return (
    <div className="space-y-4">
      <div className="print:hidden">
        <ImprimirBoton />
      </div>

      <div className="mx-auto max-w-2xl space-y-6 rounded-md border border-border bg-surface p-8 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">Factura</h1>
            <p className="text-sm text-muted">{factura.numero}</p>
          </div>
          <p className="text-sm text-muted">{factura.fechaEmision.toLocaleDateString("es-VE")}</p>
        </div>

        <div className="text-sm">
          <p className="text-muted">Facturado a</p>
          <p className="font-medium text-foreground">
            {factura.venta.paciente
              ? `${factura.venta.paciente.nombre} ${factura.venta.paciente.apellido}`
              : "Cliente sin registrar"}
          </p>
        </div>

        <table className="w-full text-sm">
          <thead className="border-b border-border text-left text-muted">
            <tr>
              <th className="py-2">Concepto</th>
              <th className="py-2 text-right">Monto</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border">
              <td className="py-2">{factura.venta.concepto}</td>
              <td className="py-2 text-right">
                {factura.venta.moneda} {factura.venta.monto.toFixed(2)}
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td className="py-2 font-medium text-foreground">Total</td>
              <td className="py-2 text-right font-medium text-foreground">
                {factura.venta.moneda} {factura.venta.monto.toFixed(2)}
              </td>
            </tr>
          </tfoot>
        </table>

        <p className="text-xs text-muted">
          Documento digital generado por el sistema. No constituye factura fiscal homologada ante el SENIAT.
        </p>
      </div>
    </div>
  );
}
