import { ipAddress, userAgent } from "../helpers/ipAndMetadata.js";
import guardarTraza from "../helpers/saveTraza.js";
import Contrato from "../models/Contratos.js";
import TipoContrato from "../models/TipoContrato.js";

// Crear un nuevo tipo de contrato
const crearTipoContrato = async (req, res) => {
  const { usuario } = req;
  const { nombre, icon, descripcion, camposRequeridos } = req.body;

  // Validar que el nombre no esté vacío
  if (!nombre || !icon || !descripcion) {
    return res.status(400).json({ msg: "Nombre, ícono y descripción son campos obligatorios" });
  }

  // Normalizar el nombre para evitar duplicados
  const nombreNormalizado = nombre.normalize('NFD').replace(/[\u0300-\u034F]/g, "").toLowerCase().trim();

  // Verificar si el tipo de contrato ya existe
  const tipoContratoExistente = await TipoContrato.findOne({ nombre: { $regex: new RegExp(nombreNormalizado, "i") } });
  if (tipoContratoExistente) {
    return res.status(400).json({ msg: "El tipo de contrato ya existe" });
  }

  try {
    // Crear el nuevo tipo de contrato
    const nuevoTipoContrato = await TipoContrato.create({
      nombre: nombre.trim(),
      icon,
      descripcion: descripcion.trim(),
      camposRequeridos,
    });

    // Guardar la traza
    await guardarTraza({
      entity_name: "TipoContrato",
      entity_id: nuevoTipoContrato._id,
      new_value: nuevoTipoContrato.nombre,
      action_type: "INSERTAR",
      changed_by: usuario.nombre,
      ip_address: ipAddress(req),
      session_id: req.sessionID,
      metadata: userAgent(req),
    });

    return res.status(200).json({ msg: "Tipo de contrato creado con éxito"});
  } catch (error) {
    return res.status(500).json({ msg: "Error al crear el tipo de contrato", error: error.message });
  }
};

// Obtener todos los tipos de contrato
const obtenerTiposContrato = async (req, res) => {
  const { usuario } = req;

  try {
    // Verificar permisos (si es necesario)
    if (usuario.tipo_usuario === "especialista") {
      return res.status(403).json({ msg: "No tienes permiso para realizar esta acción" });
    }

    // Obtener todos los tipos de contrato
    const tiposContrato = await TipoContrato.find();
    return res.status(200).json(tiposContrato);
  } catch (error) {
    return res.status(500).json({ msg: "Error al obtener los tipos de contrato", error: error.message });
  }
};

// Modificar un tipo de contrato existente (sin campos requeridos)
const modificarTipoContrato = async (req, res) => {
  const { usuario } = req;
  const { id } = req.params;
  const { nombre, icon, descripcion } = req.body;

  try {
    // Buscar el tipo de contrato existente
    const tipoContratoActual = await TipoContrato.findById(id);
    if (!tipoContratoActual) {
      return res.status(404).json({ msg: "Tipo de contrato no encontrado" });
    }

    // Normalizar el nombre para evitar duplicados
    const nombreNormalizado = nombre.normalize('NFD').replace(/[\u0300-\u034F]/g, "").toLowerCase().trim();

    // Verificar si el nuevo nombre ya existe en otro tipo de contrato
    const tipoContratoExistente = await TipoContrato.findOne({
      _id: { $ne: id }, // Excluir el tipo de contrato actual
      nombre: { $regex: new RegExp(nombreNormalizado, "i") },
    });
    if (tipoContratoExistente) {
      return res.status(400).json({ msg: "El nombre del tipo de contrato ya existe" });
    }

    // Buscar todos los contratos asociados al tipo de contrato
    const allContractAssociation = await Contrato.find({ tipoDeContrato: tipoContratoActual.nombre });

    // Si hay contratos asociados, actualizar el campo tipoDeContrato en cada uno
    let contratosActualizados = 0;
    if (allContractAssociation.length > 0) {
      const updatedContracts = await Promise.all(
        allContractAssociation.map(async (contract) => {
          try {
            // Actualizar el campo tipoDeContrato del contrato
            await Contrato.findByIdAndUpdate(
              contract._id,
              { $set: { tipoDeContrato: nombre.trim() } }, // Actualizar con el nuevo nombre
              { new: true }
            );

            // Guardar la traza de la actualización del contrato
            await guardarTraza({
              entity_name: "Contrato",
              entity_id: contract._id,
              old_value: contract.tipoDeContrato,
              new_value: nombre.trim(),
              action_type: "ACTUALIZAR",
              changed_by: usuario.nombre,
              ip_address: ipAddress(req),
              session_id: req.sessionID,
              metadata: userAgent(req),
            });
            return contract._id; // Devolver el ID del contrato actualizado
          } catch (error) {
            console.error(`Error al actualizar contrato ${contract._id}:`, error);
            return null;
          }
        })
      );

      // Filtrar los contratos actualizados correctamente
      const successfullyUpdatedContracts = updatedContracts.filter((id) => id !== null);
      contratosActualizados = successfullyUpdatedContracts.length;
    }

    // Guardar los valores antiguos para la traza
    const oldValues = {
      nombre: tipoContratoActual.nombre,
      icon: tipoContratoActual.icon,
      descripcion: tipoContratoActual.descripcion,
    };

    // Actualizar el tipo de contrato (sin campos requeridos)
    const tipoContratoActualizado = await TipoContrato.findByIdAndUpdate(
      id,
      {
        nombre: nombre.trim(),
        icon,
        descripcion: descripcion.trim(),
        modificado: Date.now(),
      },
      { new: true }
    );

    // Guardar la traza de la actualización del tipo de contrato
    await guardarTraza({
      entity_name: "TipoContrato",
      entity_id: tipoContratoActualizado._id,
      old_value: JSON.stringify({ Valores_anteriores: oldValues }, null, 2),
      new_value: JSON.stringify({ Valores_nuevos: tipoContratoActualizado }, null, 2),
      action_type: "ACTUALIZAR",
      changed_by: usuario.nombre,
      ip_address: ipAddress(req),
      session_id: req.sessionID,
      metadata: userAgent(req),
    });

    return res.status(200).json({
      msg: `Tipo de contrato modificado con éxito. ${contratosActualizados > 0 ? `Se actualizaron ${contratosActualizados} contratos asociados.` : ""}`
    });
  } catch (error) {
    return res.status(500).json({ msg: "Error al modificar el tipo de contrato", error: error.message });
  }
};
 // Actualizar los campos requeridos de un tipo de contrato
const actualizarCamposRequeridos = async (req, res) => {
  const { usuario } = req;
  const { id } = req.params;
  const { camposRequeridos } = req.body;

  try {
    // Buscar el tipo de contrato existente
    const tipoContratoActual = await TipoContrato.findById(id);
    if (!tipoContratoActual) {
      return res.status(404).json({ msg: "Tipo de contrato no encontrado" });
    }

    // Verificar si hay contratos asociados a este tipo de contrato
    const allContractAssociation = await Contrato.find({ tipoDeContrato: tipoContratoActual.nombre });
    if (allContractAssociation.length > 0) {
      return res.status(400).json({
        msg: "No se pueden modificar los campos requeridos porque ya existen contratos registrados con este tipo de contrato.",
      });
    }

    // Guardar los valores antiguos para la traza
    const oldValues = tipoContratoActual.camposRequeridos.map((requerido) => requerido.etiqueta);

    // Guardar los valores nuevos para la traza
    const newValues = camposRequeridos.map((requerido) => requerido.etiqueta);

    // Actualizar solo los campos requeridos
    const tipoContratoActualizado = await TipoContrato.findByIdAndUpdate(
      id,
      {
        camposRequeridos,
        modificado: Date.now(),
      },
      { new: true }
    );

    // Guardar la traza
    await guardarTraza({
      entity_name: "TipoContrato",
      entity_id: tipoContratoActualizado._id,
      old_value: JSON.stringify({ Valores_anteriores: oldValues }, null, 2),
      new_value: JSON.stringify({ Valores_nuevos: newValues }, null, 2),
      action_type: "ACTUALIZAR",
      changed_by: usuario.nombre,
      ip_address: ipAddress(req),
      session_id: req.sessionID,
      metadata: userAgent(req),
    });

    return res.status(200).json({
      msg: "Campos requeridos actualizados con éxito"
    });
  } catch (error) {
    return res.status(500).json({
      msg: "Error al actualizar los campos requeridos"
    });
  }
};

// Eliminar un tipo de contrato
const eliminarTipoContrato = async (req, res) => {
  const { usuario } = req;
  const { id } = req.params;
  let cantidad = 0;

  try {
    // Buscar el tipo de contrato existente
    const tipoContrato = await TipoContrato.findById(id);
    if (!tipoContrato) {
      return res.status(404).json({ msg: "Tipo de contrato no encontrado" });
    }

    // Buscar todos los contratos asociados al tipo de contrato
    const allContractAssociation = await Contrato.find({ tipoDeContrato: tipoContrato.nombre });

    // Eliminar todos los contratos asociados
    if(allContractAssociation.length > 0){
      const deletedContracts = await Promise.all(
      allContractAssociation.map(async (contract) => {
        try {
          // Guardar la traza antes de eliminar el contrato
          await guardarTraza({
            entity_name: "Contrato",
            entity_id: contract._id,
            old_value: contract.tipoDeContrato,
            action_type: "ELIMINAR",
            changed_by: usuario.nombre,
            ip_address: ipAddress(req),
            session_id: req.sessionID,
            metadata: userAgent(req),
          });

          // Eliminar el contrato
          await Contrato.deleteOne({ _id: contract._id });
          return contract._id; // Devolver el ID del contrato eliminado
        } catch (error) {
          console.error(`Error al eliminar contrato ${contract._id}:`, error);
          return null;
        }
      })
    );
    // Filtrar los contratos eliminados correctamente
    const successfullyDeletedContracts = deletedContracts.filter((id) => id !== null);
    cantidad = successfullyDeletedContracts.length;
}
    // Guardar la traza antes de eliminar el tipo de contrato
    await guardarTraza({
      entity_name: "TipoContrato",
      entity_id: tipoContrato._id,
      old_value: tipoContrato.nombre,
      action_type: "ELIMINAR",
      changed_by: usuario.nombre,
      ip_address: ipAddress(req),
      session_id: req.sessionID,
      metadata: userAgent(req),
    });

    // Eliminar el tipo de contrato
    await tipoContrato.deleteOne();

    return res.status(200).json({
      msg: `Tipo de contrato eliminado con exito. ${cantidad > 0 ? `Se eliminaron ${cantidad} contratos asociados.` : ""}`
     });
  } catch (error) {
    return res.status(500).json({ msg: "Error al eliminar el tipo de contrato", error: error.message });
  }
};

const contratosAsociados = async(req,res)=>{
const{id}=req.params;
try {
   // Buscar el tipo de contrato existente
   const tipoContratoActual = await TipoContrato.findById(id);
   if (!tipoContratoActual) {
     return res.status(404).json({ msg: "Tipo de contrato no encontrado" });
   }
   const allContractAssociation = await Contrato.find({tipoDeContrato:tipoContratoActual.nombre})
  return res.status(200).json(allContractAssociation.length);
} catch (error) {
  return res.status(500).json({ msg: "Error del servidor" });
}

}

export {
  crearTipoContrato,
  obtenerTiposContrato,
  modificarTipoContrato,
  eliminarTipoContrato,
  actualizarCamposRequeridos,
  contratosAsociados
};