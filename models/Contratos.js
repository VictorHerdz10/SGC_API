import mongoose from 'mongoose';

const contratoSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    ref: 'Contrato',
    required: true
  },
  clienteAfiliado: {
    type: mongoose.Types.ObjectId,
    ref: 'ClienteAfiliado',
    required: true
  },
  contratista: {
    type: mongoose.Types.ObjectId,
    ref: 'Contratista',
    required: true
  },
  categoria: {
    type: String,
    required: true
  },
  presupuesto: {
    type: Number,
    required: true
  },
  fechaInicio: {
    type: Date,
    required: true
  },
  fechaFin: {
    type: Date,
    required: true
  },
  estado: {
    type: String,
    enum: ['Activo', 'Inactivo'],
    default: 'Activo'
  }
}, {
  timestamps: true
});

const Contrato = mongoose.model('Contrato', contratoSchema);

export default Contrato;
