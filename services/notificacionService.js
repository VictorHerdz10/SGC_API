import Notificacion from '../models/Notificiones.js';
import Contrato from '../models/Contratos.js';
import Presupuesto from '../models/Presupuesto.js';

async function enviarNotificacion(datosNotificacion) {
  const notificacion = new Notificacion(datosNotificacion);
  await notificacion.save();
  return notificacion;
}

const notificarCaducacionProxima = async (contrato) => {
  const datosNotificacion = {
    tipo: 'Caducacion',
    contrato: contrato._id,
    mensaje: `El contrato ${contrato.nombre} está próximo a caducar.`,
    fechaEnvio: new Date(),
    leida: false,
    destinatario: contrato.contratista.toString()
  };
  return enviarNotificacion(datosNotificacion);
};

const notificarPresupuestoBajo = async (presupuesto) => {
  const datosNotificacion = {
    tipo: 'Presupuesto',
    mensaje: `El presupuesto disponible es de ${presupuesto.montoDisponible}. Este valor está próximo a terminarse.`,
    fechaEnvio: new Date(),
    leida: false,
    destinatario: 'Admin_Gnl'
  };
  return enviarNotificacion(datosNotificacion);
};

const verificarYEnviarNotificaciones = async () => {
  const seisDiasDesdeAhora = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000);
  const contratosCercaDeVencimiento = await Contrato.find({ fechaFin: { $lte: seisDiasDesdeAhora } });
  for (const contrato of contratosCercaDeVencimiento) {
    await notificarCaducacionProxima(contrato);
  }

  const umbralPresupuestoBajo = 500000;
  const presupuestosBajos = await Presupuesto.find({ montoDisponible: { $lt: umbralPresupuestoBajo } });
  
  for (const presupuesto of presupuestosBajos) {
    await notificarPresupuestoBajo(presupuesto);
  }
};

const limpiarNotificacionesAntiguas = async () => {
  const veinticuatroHorasAtras = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await Notificacion.deleteMany({ fechaEnvio: { $lt: veinticuatroHorasAtras }, leida: true });
};

export{verificarYEnviarNotificaciones,limpiarNotificacionesAntiguas};