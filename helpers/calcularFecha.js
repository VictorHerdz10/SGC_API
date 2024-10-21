const calcularFechaFin = (inicio, vigencia) => {
  // Parsear la fecha de inicio
  const inicioDate = new Date(inicio);
  
  // Inicializar los valores de duración
  let durationYears = 0;
  let durationMonths = 0;
  let durationDays = 0;

  // Expresión regular para capturar años, meses y días
  const regex = /(\d+)\s*(year|years|monht|months|day|days)/gi;
  
  // Buscar todas las coincidencias en la vigencia
  const matches = vigencia.match(regex);
  
  if (matches) {
    for (const match of matches) {
      const [_, value, unit] = match.match(/(\d+)\s*(year|years|monht|months|day|days)/i);
      const numValue = parseInt(value, 10);
      
      switch (unit.toLowerCase()) {
        case 'year':
        case 'years':
          durationYears += numValue;
          break;
        case 'monht':
        case 'months':
          durationMonths += numValue;
          break;
        case 'day':
        case 'days':
          durationDays += numValue;
          break;
      }
    }
  }

  // Calcular la fecha de fin
  let fechaFin = new Date(inicioDate);

  if (durationYears > 0) {
    fechaFin.setFullYear(fechaFin.getFullYear() + durationYears);
  }
  if (durationMonths > 0) {
    fechaFin.setMonth(fechaFin.getMonth() + durationMonths);
  }
  if (durationDays > 0) {
    fechaFin.setDate(fechaFin.getDate() + durationDays);
  }

  // Formatear la fecha en ISO 8601
  const fechaFinIso = fechaFin.toISOString();
  return fechaFinIso;
};

export default calcularFechaFin;