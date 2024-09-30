import mongoose from 'mongoose';

const presupuestoSchema = new mongoose.Schema({
  montoTotal: {
    type: Number,
    required: true
  },
  montoDisponible: {
    type: Number,
    required: true
  },
  historialModificaciones: [{
    fecha: {
      type: Date,
      default: Date.now
    },
    montoAnterior: {
      type: Number,
      required: true
    },
    montoNuevo: {
      type: Number,
      required: true
    },
    motivo: {
      type: String,
      required: true
    }
  }],
  historialInversiones:[{
  ultimaInversion: {
    fecha: {
      type: Date
    },
    montoUtilizado: {
      type: Number
    },
    descripcion: {
      type: String
    }
  }
}]
});

const Presupuesto = mongoose.model('Presupuesto', presupuestoSchema);

export default Presupuesto;
