import mongoose from 'mongoose';

const clienteAfiliadoSchema = new mongoose.Schema({
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
