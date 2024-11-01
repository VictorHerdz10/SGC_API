import Contrato from "../models/Contratos.js";
import Entidad from "../models/Entidad.js";

const crearEntidad = async (req, res) => {
    const{usuario}=req;
    const{entidad}=req.body;
    const entidadExistente =  await  Entidad.findOne({entidad});
    if(entidadExistente){
        return res.status(400).json({msg:'La entidad ya existe'})
        }

      try {
     await Entidad.create({entidad,
        ejecutivoId:usuario._id,
        nombreEjecutivo:usuario.nombre
        }
     );
    
    return res.json({ msg: "Entidad registrada con exito" });
  } catch (error) {
    res.status(500).json({ msg: "Error al crear la entidad" });
  }
};

const obtenerEntidades = async (req, res) => {
  const { usuario } = req;
  try {
    if (usuario.tipo_usuario === "director") {
      const entidades = await Entidad.find({ ejecutivoId: usuario._id });
      return res.status(200).json(entidades);
    }
    if (usuario.tipo_usuario === "especialista") {
     return res
        .status(403)
        .json({ msg: "No tienes permiso para realizar esta accion" });
    }

    const entidades = await Entidad.find();
    return  res.status(200).json(entidades);

  } catch (error) {
    res.status(500).json({ msg: "Error al obtener las entidades" });
  }
};

const modificarEntidad = async (req, res) => {
  try {
    const{entidad}=req.body;
    const entidadExistente = await Entidad.findByIdAndUpdate(
      req.params.id,
      {entidad,
        modificado: Date.now()
        
      }
      ,
      { new: true }
    );

    const contratos = await Contrato.find({
      entidad: entidadExistente.entidad,
    });
    if (contratos.length > 0) {
      const result = await contratos.updateMany(
        {},
        { $set: { entidad:entidadExistente.entidad } },
        { new: true }
      );

      console.log(`Actualizados: ${result.modifiedCount}`);
      return res.status(200).json({
        msg: `Entidad modificada con exito,se han actualizado${result.modifiedCount} contratos`  });
    }

    return res.status(200).json({msg:'Entidad modificada con exito'})
  } catch (error) {
    return res.status(500).json({ msg: "Error al modificar la direccion" });
  }
};

const eliminarEntidad = async (req, res) => {
try {
    // Primero, obtenemos la dirección a eliminar
  const entidadExistente = await Entidad.findById(req.params.id);

  if (!entidadExistente) {
    return res.status(404).json({ msg: "Entidad no encontrada" });
  }
  
    await entidadExistente.deleteOne();
    return res.status(404).json({ msg: "Entidad eliminada con éxito " });
} catch (error) {
    return res.status(500).json({ msg: "Error al eliminar la entidad" });
    
}
  
  
};

export {
    crearEntidad,
    obtenerEntidades,
    modificarEntidad,
    eliminarEntidad 
};