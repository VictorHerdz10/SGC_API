// models/Usuario.js

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const schema = new mongoose.Schema({
  nombre: {
    type: String,
    required: [true, 'Nombre es obligatorio'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Contraseña es obligatoria'],
    minlength: [8, 'La contraseña debe tener al menos 8 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Correo electrónico es obligatorio'],
    unique: true,
    lowercase: true
  },
  telefono: {
    type: String,
    default: null
  },
  tipo_usuario: {
    type: String,
    default: "Sin Asignar",
  },
  relacionId:{
    type: String,
    default: null
  },
  token: {
    type: String,
    default: null
  },
  accessToken :{
    type: String,
    default: null
  }
  
}, {
  timestamps: false
});

schema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

schema.methods.comprobarPassword = async function(passwordFormulario) {
  return await bcrypt.compare(passwordFormulario, this.password);
};

const Usuario = mongoose.model('Usuario', schema);

export default Usuario;