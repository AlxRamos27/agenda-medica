import { Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { crearPaciente } from "./actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function PacientesPage() {
  const pacientes = await prisma.paciente.findMany({
    orderBy: [{ nombre: "asc" }, { apellido: "asc" }],
    include: { _count: { select: { alergias: true } } },
  });

  return (
    <div className="space-y-8">
      <PageHeader title="Pacientes" description="Registro de pacientes y su historial médico." />

      <Card title="Nuevo paciente">
        <form action={crearPaciente} className="grid grid-cols-1 gap-3 sm:grid-cols-5">
          <Input name="nombre" placeholder="Nombre" required aria-label="Nombre" />
          <Input name="apellido" placeholder="Apellido" required aria-label="Apellido" />
          <Input name="cedula" placeholder="Cédula (opcional)" aria-label="Cédula" />
          <Input name="telefono" placeholder="Teléfono (opcional)" aria-label="Teléfono" />
          <Button type="submit">Registrar</Button>
        </form>
      </Card>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Nombre</TableHeaderCell>
            <TableHeaderCell>Cédula</TableHeaderCell>
            <TableHeaderCell>Teléfono</TableHeaderCell>
            <TableHeaderCell>Alergias</TableHeaderCell>
            <TableHeaderCell />
          </tr>
        </TableHead>
        <TableBody>
          {pacientes.map((p) => (
            <TableRow key={p.id}>
              <TableCell className="font-medium text-foreground">
                {p.nombre} {p.apellido}
              </TableCell>
              <TableCell className="text-muted">{p.cedula ?? "—"}</TableCell>
              <TableCell className="text-muted">{p.telefono ?? "—"}</TableCell>
              <TableCell>
                {p._count.alergias > 0 ? (
                  <Badge variant="danger">{p._count.alergias}</Badge>
                ) : (
                  <Badge variant="neutral">0</Badge>
                )}
              </TableCell>
              <TableCell className="text-right">
                <Button href={`/pacientes/${p.id}`} variant="secondary" size="sm">
                  Ver ficha
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {pacientes.length === 0 && (
            <TableRow>
              <TableCell colSpan={5}>
                <EmptyState
                  icon={Users}
                  title="No hay pacientes registrados todavía"
                  description="Usa el formulario de arriba para registrar el primero."
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
