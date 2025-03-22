// Función para verificar contratos vencidos
const verificarContratosVencidos = (contratos, currentDate) => {
  return contratos.filter((cont) => {
    if (cont.fechaVencimiento) {
      return cont.fechaVencimiento <= currentDate;
    }
    return false;
  });
};

export default verificarContratosVencidos;