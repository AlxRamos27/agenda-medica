"use client";

import { useActionState, useEffect, useState } from "react";
import { CalendarCheck, MessageCircle, Stethoscope, TriangleAlert } from "lucide-react";
import { solicitarCita } from "./actions";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input, Textarea } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";
const WHATSAPP_MENSAJE =
  "Hola, quisiera agendar una cita en el consultorio. Mi nombre es: ";
const WHATSAPP_HREF = WHATSAPP_NUMBER
  ? `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MENSAJE)}`
  : undefined;

export default function ReservarPage() {
  const [state, formAction, pending] = useActionState(solicitarCita, { ok: false, error: null });
  const [cargadoEn, setCargadoEn] = useState<number | null>(null);

  useEffect(() => {
    setCargadoEn(Date.now());
  }, []);

  if (state.ok) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <Card padding="lg" className="w-full max-w-sm text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-success-bg text-success-text">
            <CalendarCheck className="h-5 w-5" aria-hidden />
          </span>
          <h1 className="mt-3 text-xl font-semibold text-foreground">Solicitud enviada</h1>
          <p className="mt-2 text-sm text-muted">
            Recibimos tu solicitud de cita. Nos pondremos en contacto contigo para confirmar el
            horario.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-10">
      <Card padding="lg" className="w-full max-w-sm">
        <form action={formAction} className="space-y-4">
          <div className="mb-2 flex flex-col items-center gap-2 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <Stethoscope className="h-5 w-5" aria-hidden />
            </span>
            <h1 className="text-xl font-semibold text-foreground">Solicitar cita</h1>
            <p className="text-sm text-muted">
              Completa tus datos y te contactaremos para confirmar el horario.
            </p>
          </div>

          <input type="hidden" name="cargadoEn" value={cargadoEn ?? ""} />
          <div className="sr-only" aria-hidden="true">
            <label htmlFor="sitio_web">No llenar este campo</label>
            <input id="sitio_web" name="sitio_web" tabIndex={-1} autoComplete="off" />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Field label="Nombre" htmlFor="nombre" required>
              <Input id="nombre" name="nombre" required autoComplete="given-name" />
            </Field>
            <Field label="Apellido" htmlFor="apellido" required>
              <Input id="apellido" name="apellido" required autoComplete="family-name" />
            </Field>
          </div>

          <Field label="Teléfono" htmlFor="telefono" required>
            <Input id="telefono" name="telefono" required autoComplete="tel" placeholder="0414-1234567" />
          </Field>

          <Field label="Cédula" htmlFor="cedula">
            <Input id="cedula" name="cedula" placeholder="Opcional" />
          </Field>

          <Field label="Fecha y hora deseada" htmlFor="fecha" required>
            <Input id="fecha" name="fecha" type="datetime-local" required />
          </Field>

          <Field label="Motivo de consulta" htmlFor="motivo">
            <Textarea id="motivo" name="motivo" rows={2} placeholder="Opcional" />
          </Field>

          {state.error && (
            <p
              role="alert"
              className="flex items-center gap-2 rounded-md border border-danger-border bg-danger-bg px-3 py-2 text-sm text-danger-text"
            >
              <TriangleAlert className="h-4 w-4 shrink-0" aria-hidden />
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Enviando..." : "Solicitar cita"}
          </Button>

          {WHATSAPP_HREF && (
            <Button href={WHATSAPP_HREF} target="_blank" variant="secondary" className="w-full">
              <MessageCircle className="h-4 w-4" aria-hidden />
              Agendar por WhatsApp
            </Button>
          )}
        </form>
      </Card>
    </div>
  );
}
