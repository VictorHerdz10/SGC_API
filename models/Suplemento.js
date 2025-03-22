// models/SupplementModel.js
import mongoose from "mongoose";

const SupplementSchema = new mongoose.Schema(
  {
    nombre : {
      type :String,
      required: true
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
    createdAt: {
      type: Date,
      default: Date.now,
      immutable: true,
    },
    contratoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TipoContrato",
      required: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);
const Suplemento = mongoose.model("Suplemento", SupplementSchema);

export default Suplemento;
