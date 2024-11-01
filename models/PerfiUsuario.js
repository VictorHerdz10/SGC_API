// models/PerfilUsuario.js
import parcearDate from '../helpers/parcearFecha.js';
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
  originalName:{
    type:String,
    default:'perfil.png'
  },
  dropboxPath:{
    type:String,
  },
  foto_perfil: {
    type: String,
    default: 'https://dl.dropboxusercontent.com/s/dxx2oznitaw2n06gikqv2/perfil.png?rlkey=917o65mjq896f7daxyaur6u64&st=bzad2k26&dl=0'
  },
  creado:{
    type: Date,
    default:Date.now
  }
}, {
  timestamps: false
});

// Función middleware para establecer la foto de perfil por defecto
perfilSchema.pre('save', function(next) {
  if (!this.foto_perfil) {
    this.foto_perfil = '/public/default/perfil.png';
  }
  next();
});
// Crear el modelo
const PerfilUsuario = mongoose.model('PerfilUsuario', perfilSchema);

export default PerfilUsuario;