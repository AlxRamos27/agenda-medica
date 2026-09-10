import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verificarSesion } from "@/lib/session";

export async function proxy(request: NextRequest) {
  const sesion = await verificarSesion(request.cookies.get(SESSION_COOKIE)?.value);

  if (!sesion) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!login|reservar|api|_next/static|_next/image|favicon.ico).*)"],
};
