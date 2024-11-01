import Contrato from "../models/Contratos.js";
import Direccion from "../models/Direccion.js";

const crearDireccion = async (req, res) => {
    const{usuario}=req;
    const{direccionEjecutiva}=req.body;
    const direccion =  await  Direccion.findOne({direccionEjecutiva});
    if(direccion){
        return res.status(400).json({msg:'La direccion ya existe'})
        }

      try {
     await Direccion.create({direccionEjecutiva,
        ejecutivoId:usuario._id,
        nombreEjecutivo:usuario.nombre
        }
     );
    
    return res.status(200).json({ msg: "Direccion creada con exito" });
  } catch (error) {
   return  res.status(500).json({ msg: "Error al crear la direccion" });
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
    const{direccionEjecutiva}=req.body;
    const direccion = await Direccion.findByIdAndUpdate(
      req.params.id,
      {direccionEjecutiva,
        modificado: Date.now()
        
      }
      ,
      { new: true }
    );

    const contratos = await Contrato.find({
      direccionEjecuta: direccion.direccionEjecutiva,
    });
    if (contratos.length > 0) {
      const result = await contratos.updateMany(
        {},
        { $set: { direccionEjecuta: direccionNueva } },
        { new: true }
      );

      console.log(`Actualizados: ${result.modifiedCount}`);
      return res.status(200).json({
        msg: `Direccion modificada con exito,se han actualizado${result.modifiedCount} contratos`  });
    }

    return res.status(200).json({msg:'Direccion modificada con exito'})
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
