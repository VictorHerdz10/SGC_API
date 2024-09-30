import mongoose from 'mongoose';

const notificacionSchema = new mongoose.Schema({
  tipo: {
    type: String,
    enum: ['Caducacion', 'Presupuesto'],
    required: true
  },
  contrato: {
    type: mongoose.Types.ObjectId,
    ref: 'Contrato'
  },
  mensaje: {
    type: String,
    required: true
  },
  fechaEnvio: {
    type: Date,
    default: Date.now
  },
  leida: {
    type: Boolean,
    default: false
  },
  destinatario: {
    type: String,
    required:true
  }
}, {
  timestamps: true
});

const Notificacion = mongoose.model('Notificacion', notificacionSchema);

export default Notificacion;
