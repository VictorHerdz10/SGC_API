import mongoose from "mongoose";

// Definimos el esquema de las trazas
const trazaSchema = new mongoose.Schema(
  {
    entity_name: {
      type: String,
      required: true,
      trim: true,
    },
    entity_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false, 
    },
    action_type: {
      type: String,
      required: true,
      enum: ["INSERTAR", "ACTUALIZAR", "ELIMINAR", "INICIO_SESION", "LISTAR_DATOS","REGISTRO","RESTABLECER_CONTRASEÑA","BACKUP"], 
    },
    old_value: {
      type: String, // Almacenamos el valor antiguo como un string (podría ser un JSON stringificado)
      default: null,
    },
    new_value: {
      type: String, // Almacenamos el valor nuevo como un string (podría ser un JSON stringificado)
      default: null,
    },
    changed_by: {
      type: String,
      required: true,
      trim: true,
    },
    change_date: {
      type: Date,
      default: Date.now,
    },
    ip_address: {
      type: String,
      required: true,
      trim: true,
    },
    session_id: {
      type: String,
      required: true,
      trim: true,
    },
    transaction_id: {
      type: String,
      required: true,
      trim: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed, //
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey:false
    
  }
);

const Traza = mongoose.model("Traza", trazaSchema);

export default Traza;
