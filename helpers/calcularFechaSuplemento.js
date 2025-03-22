const calcularFechaFinSuplemento = (inicio, vigencia) => {
    // Parsear la fecha de inicio
    const inicioDate = new Date(inicio);
  
    // Verificar si la vigencia es un objeto válido
    if (!vigencia || typeof vigencia !== 'object') {
      throw new Error('La vigencia debe ser un objeto con las propiedades years, months y days');
    }
  
    // Extraer valores de la vigencia (usar 0 si no están definidos)
    const { years = 0, months = 0, days = 0 } = vigencia;
  
    // Calcular la fecha final
    const fechaFin = new Date(inicioDate);
  
    // Añadir años, meses y días
    fechaFin.setFullYear(fechaFin.getFullYear() + years);
    fechaFin.setMonth(fechaFin.getMonth() + months);
    fechaFin.setDate(fechaFin.getDate() + days);
  
    // Devolver la fecha en formato ISO 8601
    return fechaFin.toISOString();
  };
  
  export default calcularFechaFinSuplemento;