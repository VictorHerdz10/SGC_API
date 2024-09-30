import mongoose from 'mongoose';

const clienteAfiliadoSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    ref: 'ClienteAfiliado',
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  contacto: {
    type: String
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  telefono: {
    type: String
  }
}, {
  timestamps: true
});

const ClienteAfiliado = mongoose.model('ClienteAfiliado', clienteAfiliadoSchema);

export default ClienteAfiliado;
