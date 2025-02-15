import mongoose from 'mongoose';

const facturaSchema = new mongoose.Schema({
  contratoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contrato',
    required: true
  },
  numeroDictamen: {
    type: String,
    required: true
  },
  fechaCreacion: {
    type: Date,
    default: new Date().toISOString()
  
  },
  monto: {
    type: Number,
    required: true
  }
}, {
  timestamps: false,
  versionKey: false
});

const Factura = mongoose.model('Factura', facturaSchema);

export default Factura;