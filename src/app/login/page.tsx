"use client";

import { useActionState } from "react";
import { Stethoscope, TriangleAlert } from "lucide-react";
import { login } from "./actions";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, { error: null });

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card padding="lg" className="w-full max-w-sm">
        <form action={formAction} className="space-y-4">
          <div className="mb-2 flex flex-col items-center gap-2 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-700">
              <Stethoscope className="h-5 w-5" aria-hidden />
            </span>
            <h1 className="text-xl font-semibold text-foreground">Iniciar sesión</h1>
            <p className="text-sm text-muted">Agenda Médica</p>
          </div>

          <Field label="Usuario" htmlFor="usuario" required>
            <Input id="usuario" name="usuario" required autoFocus autoComplete="username" />
          </Field>

          <Field label="Contraseña" htmlFor="password" required>
            <Input id="password" name="password" type="password" required autoComplete="current-password" />
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
            {pending ? "Ingresando..." : "Ingresar"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
