import Presupuesto from "../models/Presupuesto.js";

const agregarPresupuesto = async (req, res) => {
  const { usuario } = req;
  const { monto } = req.body;

  if (usuario.tipo_usuario !== "Admin_Gnl") {
    return res
      .status(403)
      .json({ msg: "Acceso denegado para este tipo de usuario" });
  }
  try {
    const preInicial={
        montoTotal: monto,
        montoDisponible: monto,
        historialModificaciones: [
          {
            fecha: new Date(),
            montoAnterior: 0,
            montoNuevo: monto,
            motivo: "Actualización manual",
          },
        ],
      };
    await Presupuesto.create(preInicial);
    return res.status(200).json({ msg: "Presupuesto agragado correctamente" });
  } catch (error) {
    console.error("Error al agragar el presupuesto:", error);
    return res
      .status(500)
      .json({ mensaje: "Ocurrió un error al agragar el presupuesto" });
  }
};

const obtenerinfo = async (req, res) => {
  const { id } = req.params;
  const { usuario } = req;
 
  if (usuario.tipo_usuario !== "Admin_Gnl") {
    return res
      .status(403)
      .json({ msg: "Acceso denegado para este tipo de usuario" });
  }
  try {
    const presupuesto = await Presupuesto.findById(id);
    if (!presupuesto) {
      return res.status(400).json({ msg: "No hay Presupuesto activo" });
    }
   return res.status(200).json(presupuesto);
  } catch (error) {
  console.error("Error al obtener la información del presupuesto:", error);
   return res
     .status(500)
     .json({ msg: "Ocurrió un error al procesar la solicitud" });
  }
};
const modificarPresupuesto = async (req, res) => {
  const { id } = req.params;
  const { montoNuevo } = req.body;
  const { usuario } = req;
  if (usuario.tipo_usuario !== "Admin_Gnl") {
    return res
      .status(403)
      .json({ msg: "Acceso denegado para este tipo de usuario" });
  }
  try {
    const presupuesto = await Presupuesto.findById(id);
    if (!presupuesto) {
      return res.status(400).json({ msg: "No hay Presupuesto activo" });
    }
    const nuevoMontoTotal = presupuesto.montoDisponible + montoNuevo;
    const nuevoMontoDisponible = nuevoMontoTotal;
    // Actualizamos el presupuesto
    await Presupuesto.findByIdAndUpdate(
      id,
      {
        $set: {
          montoTotal: nuevoMontoTotal,
          montoDisponible: nuevoMontoDisponible,
          historialModificaciones: [
            ...presupuesto.historialModificaciones,
            {
              fecha: new Date(),
              montoAnterior: presupuesto.montoTotal,
              montoNuevo: nuevoMontoTotal,
              motivo: "Actualización manual",
            },
          ],
        },
      },
      { new: true }
    );
    return res.status(200).json({msg:"Presupuesto actualizado correctamente"});
  } catch (error) {
    console.error("Error al obtener la información del presupuesto:", error);
    return res
      .status(500)
      .json({ msg: "Ocurrió un error al procesar la solicitud" });
  }
};

export { agregarPresupuesto, obtenerinfo, modificarPresupuesto };