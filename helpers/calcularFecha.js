const calcularFechaFin = (inicio, vigencia) => {
  // Parsear la fecha de inicio
  const inicioDate = new Date(inicio);
  
  // Expresión regular para capturar años, meses y días
  const regex = /(\d+)\s*(year|years?|month|months?|day|days?)/gi;
  
  // Buscar todas las coincidencias en la vigencia
  const matches = vigencia.match(regex);
  
  if (matches) {
    let totalMilliseconds = 0;
    
    for (const match of matches) {
      const [, value, unit] = match.match(/(\d+)\s*(year|years?|month|months?|day|days?)/i);
      const numValue = parseInt(value, 10);
      
      let multiplier;
      switch (unit.toLowerCase()) {
        case 'year':
        case 'years':
          multiplier = 31536000000; // Milliseconds in a year
          break;
        case 'month':
        case 'months':
          multiplier = 2592000000; // Milliseconds in a month (approximate)
          break;
        case 'day':
        case 'days':
          multiplier = 86400000; // Milliseconds in a day
          break;
      }
      
      totalMilliseconds += numValue * multiplier;
    }
    
    // Sumar los milisegundos totales a la fecha de inicio
    const fechaFin = new Date(inicioDate.getTime() + totalMilliseconds);
    
    // Formatear la fecha en ISO 8601
    return fechaFin.toISOString();
  }
  
  // Si no se encuentra ninguna unidad de tiempo válida, devolver la fecha original
  return inicio;
};

export default calcularFechaFin;