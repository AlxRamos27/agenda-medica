"use client";

import { cambiarEstadoCita } from "./actions";
import { EstadoCita } from "@/generated/prisma/enums";
import { cn } from "@/lib/cn";

const OPCIONES: EstadoCita[] = ["PENDIENTE", "CONFIRMADA", "ATENDIDA", "CANCELADA"];

const ESTADO_CLASSES: Record<EstadoCita, string> = {
  PENDIENTE: "bg-warning-bg text-warning-text border-warning-border",
  CONFIRMADA: "bg-info-bg text-info-text border-info-border",
  ATENDIDA: "bg-success-bg text-success-text border-success-border",
  CANCELADA: "bg-danger-bg text-danger-text border-danger-border",
};

export function EstadoSelect({ citaId, estado }: { citaId: string; estado: EstadoCita }) {
  return (
    <select
      defaultValue={estado}
      aria-label="Estado de la cita"
      className={cn(
        "rounded-full border px-2.5 py-1 text-xs font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500",
        ESTADO_CLASSES[estado]
      )}
      onChange={(e) => cambiarEstadoCita(citaId, e.target.value as EstadoCita)}
    >
      {OPCIONES.map((opcion) => (
        <option key={opcion} value={opcion}>
          {opcion}
        </option>
      ))}
    </select>
  );
}
