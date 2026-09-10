"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { crearSesion, SESSION_COOKIE } from "@/lib/session";

export async function login(
  _prevState: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  const usuario = String(formData.get("usuario") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const usuarioValido = process.env.AUTH_USERNAME;
  const hashValido = process.env.AUTH_PASSWORD_HASH;

  if (!usuarioValido || !hashValido) {
    return { error: "Autenticación no configurada en el servidor." };
  }

  const credencialesOk =
    usuario === usuarioValido && (await bcrypt.compare(password, hashValido));

  if (!credencialesOk) {
    return { error: "Usuario o contraseña incorrectos." };
  }

  const sesion = await crearSesion(usuario);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sesion, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
