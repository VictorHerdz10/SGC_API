import Notificacion from "../models/Notificiones.js";

const obtenerTodasLasNotificaciones = async (req, res) => {
  const { usuario } = req;
  let notificaciones;
  try {
    if (usuario.tipo_usuario === "Admin_gnl") {
      notificaciones = await Notificacion.find().sort("-fechaEnvio");
    } else {
      notificaciones = await Notificacion.find({
        destinatario: usuario.tipo_usuario,
      }).sort("-fechaEnvio");
    }
    if (!notificaciones || notificaciones.length === 0) {
      return res.status(404).json({ msg: `Estimad@ ${usuario.nombre} no tiene notificaciones en su buzon` });
    }
    return res.status(200).json(notificaciones);
  } catch (error) {
    console.error("Error al obtener las notificaciones:", error);
    return res
      .status(500)
      .json({ msg: "Ocurrió un error al procesar la solicitud" });
  }
};

const marcarComoLeida = async (req, res) => {
  try {
    const id = req.params.id;
    await Notificacion.findByIdAndUpdate(id, { leida: true }, { new: true });
    res.status(204).send();
  } catch (error) {
    res.status(404).json({ mensaje: "Notificación no encontrada" });
  }
};

export { obtenerTodasLasNotificaciones, marcarComoLeida };
