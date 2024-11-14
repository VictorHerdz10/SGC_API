import Contrato from "../models/Contratos.js";
import Direccion from "../models/Direccion.js";

const crearDireccion = async (req, res) => {
  const { usuario } = req;
  const { direccionEjecutiva } = req.body;
  // Obtener todas las direcciones existentes
  const todasLasDirecciones = await Direccion.find();
  if (todasLasDirecciones) {
    // Parcializar todas las direcciones existentes y la dirección del cuerpo
    const todasLasDireccionesParceadas = todasLasDirecciones.map((direccion) =>
      direccion.direccionEjecutiva.normalize('NFD').replace(/[\u0300-\u034F]/g, "").toLowerCase().trim()
    );
    const direccionParceadaDelBody = direccionEjecutiva.normalize('NFD').replace(/[\u0300-\u034F]/g, "").toLowerCase().trim();
    // Verificar si la dirección del body existe en la lista parcializada de direcciones
    if (todasLasDireccionesParceadas.includes(direccionParceadaDelBody)) {
      return res.status(400).json({ msg: 'La dirección ya existe' });
  }
  }

  try {
    await Direccion.create({
      direccionEjecutiva: direccionEjecutiva.trim(),
      ejecutivoId: usuario._id,
      nombreEjecutivo: usuario.nombre,
    });

    return res.status(200).json({ msg: "Direccion creada con exito" });
  } catch (error) {
    return res.status(500).json({ msg: "Error al crear la direccion" });
  }
};

const obtenerDirecciones = async (req, res) => {
  const { usuario } = req;
  try {
    if (usuario.tipo_usuario === "director") {
      const direcciones = await Direccion.find({ ejecutivoId: usuario._id });
      return res.status(200).json(direcciones);
    }
    if (usuario.tipo_usuario === "especialista") {
      return res
        .status(403)
        .json({ msg: "No tienes permiso para realizar esta accion" });
    }

    const direcciones = await Direccion.find();
    return res.status(200).json(direcciones);
  } catch (error) {
    return res.status(500).json({ msg: "Error al obtener las direcciones" });
  }
};

const modificarDireccion = async (req, res) => {
  try {
    const { direccionEjecutiva } = req.body;
    const direccionactual= await Direccion.findById(req.params.id);
    const direccion = await Direccion.findByIdAndUpdate(
      req.params.id,
      { direccionEjecutiva, modificado: Date.now() },
      { new: true }
    );

    const contratos = await Contrato.find({
      direccionEjecuta: direccionactual.direccionEjecutiva,
    });
    if (contratos.length > 0) {
      // Modificar cada contrato uno por uno
      const updatedCount = await Promise.all(
        contratos.map(async (contract) => {
          try {
            const result = await Contrato.findByIdAndUpdate(
              contract._id,
              { $set: { direccionEjecutiva } },
              { new: true }
            );
            return result;
          } catch (error) {
            console.error(
              `Error al actualizar contrato ${contract._id}:`,
              error
            );
            return null;
          }
        })
      );

      // Filtrar los resultados para contar solo los que fueron actualizados exitosamente
      const successfulUpdates = updatedCount.filter(Boolean);
      return res.status(200).json({
        msg: `Direccion modificada con exito, se han actualizado${successfulUpdates.length} contratos`,
      });
    }

    return res.status(200).json({ msg: "Direccion modificada con exito" });
  } catch (error) {
    return res.status(500).json({ msg: "Error al modificar la direccion" });
  }
};

const eliminarDireccion = async (req, res) => {
  const { usuario } = req;
  // Primero, obtenemos la dirección a eliminar
  const direccion = await Direccion.findById(req.params.id);

  if (!direccion) {
    return res.status(404).json({ msg: "Dirección no encontrada" });
  }

  await direccion.deleteOne();
  res.json({
    msg: `Dirección eliminada con éxito`,
  });
};

export {
  crearDireccion,
  obtenerDirecciones,
  modificarDireccion,
  eliminarDireccion,
};
