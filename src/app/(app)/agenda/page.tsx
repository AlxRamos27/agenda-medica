import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { crearCita } from "./actions";
import { EstadoSelect } from "./estado-select";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Select, Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Table, TableHead, TableBody, TableRow, TableHeaderCell, TableCell } from "@/components/ui/Table";
import { EmptyState } from "@/components/ui/EmptyState";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const [citas, pacientes] = await Promise.all([
    prisma.cita.findMany({
      orderBy: { fecha: "asc" },
      include: { paciente: true },
    }),
    prisma.paciente.findMany({ orderBy: { nombre: "asc" } }),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader title="Agenda" description="Programa y da seguimiento a las citas del consultorio." />

      <Card title="Nueva cita">
        {pacientes.length === 0 ? (
          <p className="text-sm text-muted">
            Primero registra un paciente en la sección{" "}
            <Link href="/pacientes" className="font-medium text-brand-700 underline">
              Pacientes
            </Link>
            .
          </p>
        ) : (
          <form action={crearCita} className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <Select name="pacienteId" required aria-label="Paciente">
              <option value="">Selecciona paciente</option>
              {pacientes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nombre} {p.apellido}
                </option>
              ))}
            </Select>
            <Input type="datetime-local" name="fecha" required aria-label="Fecha y hora" />
            <Input type="text" name="motivo" placeholder="Motivo (opcional)" aria-label="Motivo" />
            <Button type="submit">Agendar</Button>
          </form>
        )}
      </Card>

      <Table>
        <TableHead>
          <tr>
            <TableHeaderCell>Fecha</TableHeaderCell>
            <TableHeaderCell>Paciente</TableHeaderCell>
            <TableHeaderCell>Motivo</TableHeaderCell>
            <TableHeaderCell>Estado</TableHeaderCell>
          </tr>
        </TableHead>
        <TableBody>
          {citas.map((cita) => (
            <TableRow key={cita.id}>
              <TableCell className="whitespace-nowrap">
                {cita.fecha.toLocaleString("es-VE", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </TableCell>
              <TableCell>
                {cita.paciente.nombre} {cita.paciente.apellido}
              </TableCell>
              <TableCell className="text-muted">{cita.motivo ?? "—"}</TableCell>
              <TableCell>
                <EstadoSelect citaId={cita.id} estado={cita.estado} />
              </TableCell>
            </TableRow>
          ))}
          {citas.length === 0 && (
            <TableRow>
              <TableCell colSpan={4}>
                <EmptyState
                  icon={CalendarDays}
                  title="No hay citas agendadas todavía"
                  description="Usa el formulario de arriba para crear la primera cita."
                />
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
