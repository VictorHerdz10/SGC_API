import mongoose from 'mongoose';

const contratistaSchema = new mongoose.Schema({
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
  },
  especialidad: {
    type: [String]
  }
}, {
  timestamps: true
});

const Contratista = mongoose.model('Contratista', contratistaSchema);

export default Contratista;
