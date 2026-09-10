import Link from "next/link";
import { CalendarDays, ChevronRight, DollarSign, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const hoy = new Date();
  const inicioHoy = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const finHoy = new Date(inicioHoy);
  finHoy.setDate(finHoy.getDate() + 1);

  const [citasHoy, totalPacientes, ventasMes] = await Promise.all([
    prisma.cita.count({
      where: { fecha: { gte: inicioHoy, lt: finHoy } },
    }),
    prisma.paciente.count(),
    prisma.venta.aggregate({
      _sum: { monto: true },
      where: {
        fecha: {
          gte: new Date(hoy.getFullYear(), hoy.getMonth(), 1),
        },
      },
    }),
  ]);

  const tarjetas = [
    {
      label: "Citas de hoy",
      valor: citasHoy,
      href: "/agenda",
      icon: CalendarDays,
    },
    {
      label: "Pacientes registrados",
      valor: totalPacientes,
      href: "/pacientes",
      icon: Users,
    },
    {
      label: "Ventas del mes (USD)",
      valor: `$${(ventasMes._sum.monto ?? 0).toFixed(2)}`,
      href: "/administracion",
      icon: DollarSign,
    },
  ];

  return (
    <div>
      <PageHeader title="Resumen" description="Vista general de la actividad del consultorio." />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {tarjetas.map((t) => (
          <Link key={t.label} href={t.href} className="block">
            <Card className="transition-shadow hover:shadow-md">
              <div className="flex items-start justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                  <t.icon className="h-5 w-5" aria-hidden />
                </span>
                <ChevronRight className="h-4 w-4 text-muted" aria-hidden />
              </div>
              <p className="mt-3 text-sm text-muted">{t.label}</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{t.valor}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
