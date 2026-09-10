import Link from "next/link";
import { Receipt } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { generarFactura } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function FacturacionPage() {
  const [ventasSinFactura, facturas] = await Promise.all([
    prisma.venta.findMany({
      where: { factura: null },
      orderBy: { fecha: "desc" },
      include: { paciente: true },
    }),
    prisma.factura.findMany({
      orderBy: { fechaEmision: "desc" },
      include: { venta: { include: { paciente: true } } },
    }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Facturación"
        description="La factura se genera a partir de una venta registrada en Administración. Por ahora emite un documento digital simple (PDF vía impresión del navegador); la integración con un proveedor homologado ante el SENIAT para validez fiscal queda como siguiente fase."
      />

      <Card title="Ventas pendientes de facturar" className="space-y-3">
        {ventasSinFactura.length === 0 ? (
          <p className="text-sm text-muted">No hay ventas pendientes de facturar.</p>
        ) : (
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Fecha</TableHeaderCell>
                <TableHeaderCell>Concepto</TableHeaderCell>
                <TableHeaderCell className="text-right">Monto</TableHeaderCell>
                <TableHeaderCell />
              </tr>
            </TableHead>
            <TableBody>
              {ventasSinFactura.map((v) => (
                <TableRow key={v.id}>
                  <TableCell className="whitespace-nowrap text-muted">
                    {v.fecha.toLocaleDateString("es-VE")}
                  </TableCell>
                  <TableCell>
                    {v.concepto}
                    {v.paciente ? ` · ${v.paciente.nombre} ${v.paciente.apellido}` : ""}
                  </TableCell>
                  <TableCell className="text-right font-medium">${v.monto.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <form action={generarFactura.bind(null, v.id)}>
                      <Button type="submit" size="sm">
                        Generar factura
                      </Button>
                    </form>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Card title="Facturas emitidas" className="space-y-3">
        {facturas.length === 0 ? (
          <EmptyState icon={Receipt} title="Aún no se han emitido facturas" />
        ) : (
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>N.° de factura</TableHeaderCell>
                <TableHeaderCell>Fecha</TableHeaderCell>
                <TableHeaderCell>Concepto</TableHeaderCell>
                <TableHeaderCell className="text-right">Monto</TableHeaderCell>
                <TableHeaderCell />
              </tr>
            </TableHead>
            <TableBody>
              {facturas.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium text-foreground">{f.numero}</TableCell>
                  <TableCell className="whitespace-nowrap text-muted">
                    {f.fechaEmision.toLocaleDateString("es-VE")}
                  </TableCell>
                  <TableCell>{f.venta.concepto}</TableCell>
                  <TableCell className="text-right font-medium">${f.venta.monto.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <Button href={`/facturacion/${f.id}`} variant="secondary" size="sm">
                      Ver / imprimir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  );
}
