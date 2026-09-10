export function formatoMonto(monto: number) {
  return monto.toLocaleString("es-VE", { minimumFractionDigits: 2 });
}
