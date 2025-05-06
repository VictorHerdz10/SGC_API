import mongoose from "mongoose";

const SupplementSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: true
    },
    monto: {
      type: Number,
      required: false,
      default: null,
      min: 0,
    },
    montoOriginal: {  // Nuevo campo para guardar el monto inicial
      type: Number,
      required: false,
      default: null,
      min: 0,
    },
    tiempo: {
      years: {
        type: Number,
        required: false,
        default: 0,
        min: 0,
      },
      months: {
        type: Number,
        required: false,
        default: 0,
        min: 0,
        max: 11,
      },
      days: {
        type: Number,
        required: false,
        default: 0,
        min: 0,
        max: 30,
      },
    },
    isGlobal: {  // Nuevo campo para identificar suplementos globales
      type: Boolean,
      default: false
    },
    usedBy: [{  // Para rastrear qué contratos específicos usaron este suplemento
      contratoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Contrato"
      },
      montoUsado: Number,
      fechaUso: {
        type: Date,
        default: Date.now
      }
    }],
    contratoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contrato",
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

const Suplemento = mongoose.model("Suplemento", SupplementSchema);

export default Suplemento;