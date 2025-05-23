import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    icon: {
      type: String,
      required: true,
      trim: true,
    },
    descripcion: {
      type: String,
      required: true,
      trim: true,
    },
    camposRequeridos: [
      {
        id: {
          type: String,
        },
        etiqueta: {
          type: String,
        },
        descripcion: {
          type: String,
        },
      },
    ],
    isMarco: {
      type: Boolean,
      default: false,
    },
    isEspecifico: {
      type: Boolean,
      default: false,
    },
    marcoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TipoContrato",
    },
    creado: {
      type: Date,
      default: Date.now(),
    },
    modificado: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

const TipoContrato = mongoose.model("TipoContrato", schema);

export default TipoContrato;
