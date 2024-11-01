import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true
  },
  readByAdmin: {
    type: Boolean,
    default: false
  },
  readByDirector: {
    type: Boolean,
    default: false
  },
  readByEspecialista: {
    type: Boolean,
    default: false
    },
    direccionEjecutiva: {
    type: String,
    required: true
  },
  entidad:{
    type: String,
    required: true
  },
  contratoId:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contrato'
  },
  fechaVencimiento: {
    type: Date,
    required: true
  },
  create: {
    type: Date,
    default: Date.now
  }
}, { timestamps: false });

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;