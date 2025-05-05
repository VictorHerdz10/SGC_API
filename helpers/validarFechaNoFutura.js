export function validarFechaNoFutura(fechaStr) {
  if (!fechaStr) return; // Si la fecha está vacía, no validamos

  const fechaActual = new Date();
  fechaActual.setHours(0, 0, 0, 0); // Normalizamos a medianoche

  const fechaComparar = new Date(fechaStr);
  fechaComparar.setHours(0, 0, 0, 0); // Normalizamos

  if (fechaComparar > fechaActual) {
    console.log("❌ Fecha futura detectada");
    return true;
  }

  console.log("✅ Fecha válida");
  return false;
}