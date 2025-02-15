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
        monto:{ type:Number}
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
    versionKey:false
  }
);

const Contrato = mongoose.model("Contrato", contratoSchema);

export default Contrato;
