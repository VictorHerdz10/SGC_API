// models/Direccion.js

import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  ejecutivoId: {
    type: mongoose.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  nombreEjecutivo:{
    type: String,
    required: true,
    trim: true
  },
  entidad: {
    type: String,
    required: true
  },
  creado: {
    type: Date,
    default: Date.now()
  },
  modificado:{
    type: Date,
    default: Date.now()
  }
}, {
  timestamps: false
});

const Entidad = mongoose.model('Entidad', schema);

export default Entidad;