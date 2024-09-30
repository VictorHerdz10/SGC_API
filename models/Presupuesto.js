import mongoose from 'mongoose';

const presupuestoSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    ref: 'Presupuesto',
    required: true
  },
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
}, {
  timestamps: true
});

const Presupuesto = mongoose.model('Presupuesto', presupuestoSchema);

export default Presupuesto;
