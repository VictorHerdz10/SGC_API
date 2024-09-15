import Expediente from "../models/Expediente.js";
import Solicitud from "../models/Solicitud.js";

const checkRequest = async (req, res, next) => {
  try {
    const { ci } = req.params;
    const expediente = await Expediente.findOne({ where: { ci } });
    const solicitud = await Solicitud.findOne({
      where: { id_expediente: expediente.id_expediente, confirmado: true },
    });
    if (solicitud === null ) {
      // Si nes nula es porq todavia no se ah confirmado la solicitud de parte de la secretaria
      return res
        .status(403)
        .json({msg:
          "No se puede modificar el expediente, la solicitud se encuenta pendiente todavia"
        });
    }

    if (!solicitud) {
      // Si no hay una solicitud aceptada para el expediente, no permitir la modificación
      return res
        .status(403)
        .json({msg:
          "No se puede modificar el expediente sin una solicitud aceptada, si no lo ah solicitado puede hacerlo ahora."
        });
    }

    // Si la solicitud ha sido aceptada, se le permite continuar al siguiente middleware
    next();
  } catch (error) {
    console.error("Error al verificar el estado de la solicitud:", error);
    res.status(500).json({msg: "Error interno del servidor."});
  }
};

export default checkRequest;
