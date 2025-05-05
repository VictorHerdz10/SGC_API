import mongoose from "mongoose";

const NotificationSchema = new mongoose.Schema(
  {
    description: {
      type: String,
      required: true,
    },
    readByAdmin: {
      type: Boolean,
      default: false,
    },
    readByDirector: {
      type: Boolean,
      default: false,
    },
    readByEspecialista: {
      type: Boolean,
      default: false,
    },
    direccionEjecutiva: {
      type: String,
      required: true,
    },
    entidad: {
      type: String,
      required: true,
    },
    contratoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contrato",
    },
    fechaVencimiento: {
      type: Date,
      required: true,
    },
    valorDisponible: {
      type: Number,
    },
    create: {
      type: Date,
      default: Date.now,
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
  { timestamps: false, versionKey: false }
);

const Notification = mongoose.model("Notification", NotificationSchema);
export default Notification;
