import { prisma } from "@/lib/prisma";
import { crearVenta, crearCompra, crearGasto } from "./actions";
import { formatoMonto } from "@/lib/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input, Select } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";

export const dynamic = "force-dynamic";

export default async function AdministracionPage() {
  const [ventas, compras, gastos, pacientes] = await Promise.all([
    prisma.venta.findMany({
      orderBy: { fecha: "desc" },
      take: 20,
      include: { paciente: true },
    }),
    prisma.compra.findMany({ orderBy: { fecha: "desc" }, take: 20 }),
    prisma.gasto.findMany({ orderBy: { fecha: "desc" }, take: 20 }),
    prisma.paciente.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  const totalVentas = ventas.reduce((acc, v) => acc + v.monto, 0);
  const totalCompras = compras.reduce((acc, c) => acc + c.monto, 0);
  const totalGastos = gastos.reduce((acc, g) => acc + g.monto, 0);
  const balance = totalVentas - totalCompras - totalGastos;

  return (
    <div className="space-y-8">
      <PageHeader title="Administración" description="Ventas, compras y gastos del consultorio." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card padding="sm">
          <p className="text-sm text-muted">Ventas</p>
          <p className="mt-1 text-lg font-semibold text-success-text">${formatoMonto(totalVentas)}</p>
        </Card>
        <Card padding="sm">
          <p className="text-sm text-muted">Compras</p>
          <p className="mt-1 text-lg font-semibold text-danger-text">${formatoMonto(totalCompras)}</p>
        </Card>
        <Card padding="sm">
          <p className="text-sm text-muted">Gastos</p>
          <p className="mt-1 text-lg font-semibold text-danger-text">${formatoMonto(totalGastos)}</p>
        </Card>
        <Card padding="sm">
          <p className="text-sm text-muted">Balance</p>
          <p className="mt-1 text-lg font-semibold text-foreground">${formatoMonto(balance)}</p>
        </Card>
      </div>

      <Card title="Ventas" className="space-y-3">
        <form action={crearVenta} className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          <Select name="pacienteId" aria-label="Paciente" className="sm:col-span-1">
            <option value="">Sin paciente</option>
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} {p.apellido}
              </option>
            ))}
          </Select>
          <Input name="concepto" placeholder="Concepto (ej: consulta)" required aria-label="Concepto" />
          <Input
            name="monto"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Monto USD"
            required
            aria-label="Monto"
          />
          <Select name="metodoPago" defaultValue="PAGO_MOVIL" aria-label="Método de pago">
            <option value="PAGO_MOVIL">Pago móvil</option>
            <option value="EFECTIVO">Efectivo</option>
            <option value="TRANSFERENCIA">Transferencia</option>
            <option value="ZELLE">Zelle</option>
            <option value="OTRO">Otro</option>
          </Select>
          <Button type="submit">Registrar venta</Button>
        </form>
        <ListaMovimientos
          items={ventas.map((v) => ({
            id: v.id,
            fecha: v.fecha,
            concepto: `${v.concepto}${v.paciente ? ` · ${v.paciente.nombre} ${v.paciente.apellido}` : ""}`,
            monto: v.monto,
          }))}
          tono="success"
        />
      </Card>

      <Card title="Compras" className="space-y-3">
        <form action={crearCompra} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <Input name="concepto" placeholder="Concepto" required aria-label="Concepto" />
          <Input name="proveedor" placeholder="Proveedor (opcional)" aria-label="Proveedor" />
          <Input
            name="monto"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Monto USD"
            required
            aria-label="Monto"
          />
          <Button type="submit">Registrar compra</Button>
        </form>
        <ListaMovimientos
          items={compras.map((c) => ({
            id: c.id,
            fecha: c.fecha,
            concepto: `${c.concepto}${c.proveedor ? ` · ${c.proveedor}` : ""}`,
            monto: c.monto,
          }))}
          tono="danger"
        />
      </Card>

      <Card title="Gastos" className="space-y-3">
        <form action={crearGasto} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
          <Input name="concepto" placeholder="Concepto" required aria-label="Concepto" />
          <Input name="categoria" placeholder="Categoría (opcional)" aria-label="Categoría" />
          <Input
            name="monto"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Monto USD"
            required
            aria-label="Monto"
          />
          <Button type="submit">Registrar gasto</Button>
        </form>
        <ListaMovimientos
          items={gastos.map((g) => ({
            id: g.id,
            fecha: g.fecha,
            concepto: `${g.concepto}${g.categoria ? ` · ${g.categoria}` : ""}`,
            monto: g.monto,
          }))}
          tono="danger"
        />
      </Card>
    </div>
  );
}

function ListaMovimientos({
  items,
  tono,
}: {
  items: { id: string; fecha: Date; concepto: string; monto: number }[];
  tono: "success" | "danger";
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted">Sin movimientos todavía.</p>;
  }
  return (
    <Table>
      <TableHead>
        <tr>
          <TableHeaderCell>Fecha</TableHeaderCell>
          <TableHeaderCell>Concepto</TableHeaderCell>
          <TableHeaderCell className="text-right">Monto</TableHeaderCell>
        </tr>
      </TableHead>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="whitespace-nowrap text-muted">
              {item.fecha.toLocaleDateString("es-VE")}
            </TableCell>
            <TableCell>{item.concepto}</TableCell>
            <TableCell
              className={`text-right font-medium ${tono === "success" ? "text-success-text" : "text-danger-text"}`}
            >
              ${formatoMonto(item.monto)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
