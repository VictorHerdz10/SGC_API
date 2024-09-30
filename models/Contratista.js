import mongoose from 'mongoose';

const contratistaSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    ref: 'Contratista',
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
  },
  especialidad: {
    type: [String]
  }
}, {
  timestamps: true
});

const Contratista = mongoose.model('Contratista', contratistaSchema);

export default Contratista;
