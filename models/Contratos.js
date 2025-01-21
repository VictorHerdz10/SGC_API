import mongoose from "mongoose";

const contratoSchema = new mongoose.Schema(
  {
    info:{
        creadoPor: { type: String },
        fechaDeCreacion: { type: Date },
        modificadoPor: { type: String },
        fechaDeModificacion: { type: Date },
      }
    ,
    tipoDeContrato: {
      type: String,
      required: true,
    },
    objetoDelContrato: {
      type: String,
      required: true,
    },
    entidad: {
      type: String,
      required: true,
    },
    direccionEjecuta: {
      type: String,
      required: true,
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
      required: true,
    },
    valorPrincipal: {
      type: Number,
      required: true,
    },
    valorDisponible: {
      type: Number,
      required: true,
    },
    valorGastado: {
      type: Number,
      default: 0,
    },
    factura: [
      {
        numeroDictamen: { type: String },
        monto:{ type:Number}
      },
    ],
    vigencia: {
      type: String,
      required: true,
    },
    fechaVencimiento: {
      type: Date,
      required: true,
    },
    estado: {
      type: String,
    },
    numeroDictamen: {
      type: String,
      required: true,
    },
    originalName:{
      type:String,
    },
    dropboxPath:{
      type:String,
    },
    subirPDF: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: false,
  }
);

const Contrato = mongoose.model("Contrato", contratoSchema);

export default Contrato;
