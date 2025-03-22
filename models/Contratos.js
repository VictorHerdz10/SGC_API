import mongoose from "mongoose";

const contratoSchema = new mongoose.Schema(
  {
    info: {
      creadoPor: { type: String },
      fechaDeCreacion: { type: Date },
      modificadoPor: { type: String },
      fechaDeModificacion: { type: Date },
    },
    tipoDeContrato: {
      type: String,
      required: true,
    },
    objetoDelContrato: {
      type: String,
    },
    entidad: {
      type: String,
    },
    direccionEjecuta: {
      type: String,
    },
    aprobadoPorCC: {
      type: Date,
    },
    firmado: {
      type: Date,
    },
    entregadoJuridica: {
      type: Date,
    },
    fechaRecibido: {
      type: Date,
    },
    valorPrincipal: {
      type: Number,
    },
    valorDisponible: {
      type: Number,
    },
    valorGastado: {
      type: Number,
      default: 0,
    },
    factura: [
      {
        numeroDictamen: { type: String },
        monto: { type: Number },
        montoSuplement: { type: Number },
      },
    ],
    vigencia: {
      type: String,
    },
    fechaVencimiento: {
      type: Date,
    },
    estado: {
      type: String,
    },
    numeroDictamen: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
    },
    dropboxPath: {
      type: String,
    },
    subirPDF: {
      type: String,
      default: null,
    },
    isGotSupplement: {
      type: Boolean,
      default: false,
    },
    supplement: [
      {
        nombre: {
          type: String,
          required: true,
        },
        montoOriginal:{
          type: Number,
          required: false,
          default: null,
          min: 0

        },
        monto: {
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
      },
    ],
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

const Contrato = mongoose.model("Contrato", contratoSchema);

export default Contrato;
