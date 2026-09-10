import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { agregarAlergia, agregarRegistroHistorial } from "../actions";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input, Select, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import type { Severidad } from "@/generated/prisma/enums";

const SEVERIDAD_VARIANT: Record<Severidad, "neutral" | "warning" | "danger"> = {
  LEVE: "neutral",
  MODERADA: "warning",
  SEVERA: "danger",
};

const SEVERIDAD_LABEL: Record<Severidad, string> = {
  LEVE: "Leve",
  MODERADA: "Moderada",
  SEVERA: "Severa",
};

export const dynamic = "force-dynamic";

export default async function PacienteDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const paciente = await prisma.paciente.findUnique({
    where: { id },
    include: {
      alergias: { orderBy: { createdAt: "desc" } },
      historial: { orderBy: { fecha: "desc" } },
    },
  });

  if (!paciente) notFound();

  const agregarAlergiaConPaciente = agregarAlergia.bind(null, paciente.id);
  const agregarRegistroConPaciente = agregarRegistroHistorial.bind(null, paciente.id);

  return (
    <div className="space-y-8">
      <PageHeader
        title={`${paciente.nombre} ${paciente.apellido}`}
        description={`${paciente.cedula ?? "Sin cédula"} · ${paciente.telefono ?? "Sin teléfono"}`}
      />

      <Card title="Alergias y datos de relevancia" className="space-y-3">
        <ul className="space-y-2">
          {paciente.alergias.map((a) => (
            <li key={a.id} className="flex flex-wrap items-center gap-2 text-sm">
              <Badge variant={SEVERIDAD_VARIANT[a.severidad]}>{SEVERIDAD_LABEL[a.severidad]}</Badge>
              <span className="text-foreground">{a.descripcion}</span>
            </li>
          ))}
          {paciente.alergias.length === 0 && (
            <li className="text-sm text-muted">Ninguna registrada.</li>
          )}
        </ul>
        <form action={agregarAlergiaConPaciente} className="flex flex-wrap gap-2 pt-2">
          <Input
            name="descripcion"
            placeholder="Ej: alergia a la penicilina"
            required
            aria-label="Descripción de la alergia"
            className="min-w-[200px] flex-1"
          />
          <Select name="severidad" defaultValue="MODERADA" aria-label="Severidad" className="w-auto">
            <option value="LEVE">Leve</option>
            <option value="MODERADA">Moderada</option>
            <option value="SEVERA">Severa</option>
          </Select>
          <Button type="submit">Agregar</Button>
        </form>
      </Card>

      <Card title="Historial médico" className="space-y-3">
        <form action={agregarRegistroConPaciente} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            name="motivoConsulta"
            placeholder="Motivo de consulta"
            required
            aria-label="Motivo de consulta"
            className="sm:col-span-2"
          />
          <Input name="diagnostico" placeholder="Diagnóstico (opcional)" aria-label="Diagnóstico" />
          <Input name="tratamiento" placeholder="Tratamiento (opcional)" aria-label="Tratamiento" />
          <Textarea
            name="notas"
            placeholder="Notas adicionales (opcional)"
            aria-label="Notas adicionales"
            className="sm:col-span-2"
            rows={2}
          />
          <Button type="submit" className="sm:col-span-2 sm:w-fit">
            Guardar registro
          </Button>
        </form>

        <ul className="space-y-3 pt-2">
          {paciente.historial.map((h) => (
            <li key={h.id} className="border-t border-border pt-3 text-sm">
              <p className="text-xs text-muted">
                {h.fecha.toLocaleString("es-VE", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
              <p className="font-medium text-foreground">{h.motivoConsulta}</p>
              {h.diagnostico && <p className="text-muted">Diagnóstico: {h.diagnostico}</p>}
              {h.tratamiento && <p className="text-muted">Tratamiento: {h.tratamiento}</p>}
              {h.notas && <p className="italic text-muted">{h.notas}</p>}
            </li>
          ))}
          {paciente.historial.length === 0 && (
            <li className="text-sm text-muted">Sin registros todavía.</li>
          )}
        </ul>
      </Card>
    </div>
  );
}
