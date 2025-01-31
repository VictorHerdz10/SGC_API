import Traza from "../models/Trazas.js";
import { v4 as uuidv4 } from "uuid";

/**
 * Guarda una traza en la base de datos.
 * @param {Object} params - Parámetros para la traza.
 * @param {string} params.entity_name - Nombre de la entidad afectada.
 * @param {string} params.action_type - Tipo de acción.
 * @param {string} params.changed_by - Usuario que realizó la acción.
 * @param {string} params.ip_address - Dirección IP del usuario.
 * @param {string} params.session_id - ID de la sesión del usuario.
 * @param {Object} [params.metadata] - Metadatos adicionales.
 * @param {mongoose.Types.ObjectId} [params.entity_id] - ID de la entidad afectada.
 * @param {string} [params.old_value] - Valor antiguo.
 * @param {string} [params.new_value] - Valor nuevo.
 * @returns {Promise<void>}
 */
const guardarTraza = async (params) => {
  try {
    const nuevaTraza = new Traza({
      entity_name: params.entity_name,
      entity_id: params.entity_id || null,
      action_type: params.action_type,
      old_value: params.old_value || null,
      new_value: params.new_value || null,
      changed_by: params.changed_by,
      ip_address: params.ip_address,
      session_id: params.session_id,
      transaction_id: uuidv4(), // Genera un ID único para la transacción
      metadata: params.metadata || null,
    });

    await nuevaTraza.save();
    console.log("Traza guardada correctamente:", nuevaTraza);
  } catch (error) {
    console.error("Error al guardar la traza:", error);
  }
};

export default guardarTraza;