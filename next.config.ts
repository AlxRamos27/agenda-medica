import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  // El cliente de Prisma se genera en una ruta custom (src/generated/prisma,
  // no node_modules/.prisma). El file-tracing serverless de Vercel no
  // detecta el binario del query engine ahí por defecto, así que hay que
  // incluirlo explícitamente para que no falle en runtime.
  outputFileTracingIncludes: {
    "/**": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
