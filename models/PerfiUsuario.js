// models/PerfilUsuario.js

import mongoose from 'mongoose';

const perfilSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  tipo_usuario: {
    type: String,
    required: true
  },
  telefono: {
    type: String,
    default: null
  },
  cargo: {
    type: String,
    default: null
  },
  foto_perfil: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

// Crear el modelo
const PerfilUsuario = mongoose.model('PerfilUsuario', perfilSchema);

export default PerfilUsuario;