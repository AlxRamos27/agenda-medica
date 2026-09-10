export const SESSION_COOKIE = "session";
const SESSION_DURATION_MS = 1000 * 60 * 60 * 12; // 12 horas

function base64UrlEncode(bytes: Uint8Array) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function getKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("Falta AUTH_SECRET en las variables de entorno");
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

export async function crearSesion(usuario: string): Promise<string> {
  const payload = JSON.stringify({ u: usuario, exp: Date.now() + SESSION_DURATION_MS });
  const payloadBytes = new TextEncoder().encode(payload);
  const key = await getKey();
  const firma = await crypto.subtle.sign("HMAC", key, payloadBytes);
  return `${base64UrlEncode(payloadBytes)}.${base64UrlEncode(new Uint8Array(firma))}`;
}

export async function verificarSesion(valor: string | undefined): Promise<string | null> {
  if (!valor) return null;
  const [payloadPart, firmaPart] = valor.split(".");
  if (!payloadPart || !firmaPart) return null;

  try {
    const payloadBytes = base64UrlDecode(payloadPart);
    const key = await getKey();
    const valido = await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(firmaPart),
      payloadBytes
    );
    if (!valido) return null;

    const { u, exp } = JSON.parse(new TextDecoder().decode(payloadBytes)) as {
      u: string;
      exp: number;
    };
    if (Date.now() > exp) return null;
    return u;
  } catch {
    return null;
  }
}
