import Contrato from "../models/Contratos.js";
import Factura from "../models/Factura.js";

const crearFactura = async (req, res) => {
  const { _id, numeroDictamen, monto } = req.body;
   // Convertir monto a número
   const montoNumber = Number(monto);
  try {
    const facturas = await Factura.find();
    if (facturas) {
      // Parcializar todas las direcciones existentes y la dirección del cuerpo
      const todasLasfacturasParceadas = facturas.map(factura =>
        factura.numeroDictamen.normalize('NFD').replace(/[\u0300-\u034F]/g, "").toLowerCase().trim()
      );
      const facturaParceadaDelBody = numeroDictamen.normalize('NFD').replace(/[\u0300-\u034F]/g, "").toLowerCase().trim();
      // Verificar si la dirección del body existe en la lista parcializada de direcciones
      if (todasLasfacturasParceadas.includes(facturaParceadaDelBody)) {
        return res.status(400).json({ msg: 'La factura ya existe' });
    }
    }
    await Factura.create({
      contratoId: _id,
      numeroDictamen,
      monto:montoNumber,
    });
    const contrato = await Contrato.findByIdAndUpdate(
      _id, // El ID del contrato que quieres actualizar
      {
        $push: {
          // Usa $push para agregar un nuevo elemento al array
          factura: { numeroDictamen , monto:montoNumber }, // El nuevo objeto que deseas agregar
        },
      },
      { new: true } // Opcional: devuelve el documento actualizado
    );
  
    contrato.valorGastado = contrato.valorGastado + montoNumber;
    contrato.valorDisponible = contrato.valorDisponible - montoNumber;
    await contrato.save();
    return res.status(200).json({ msg: "Se ah agregado una nueva factura" });
  } catch (error) {
    console.error("Ha ocurrido un error al crear la factura:", error);
    return res.status(500).json({ msg: "Error al intentar crear la factura" });
  }
};

const advertenciamontoCrear = async (req, res) => {
  const { _id, monto } = req.body;
  try {
    const contrato = await Contrato.findById(_id);
    if (contrato.valorDisponible < monto) {
      return res.status(400).json({
        msg: "No hay suficiente presupuesto para registrar esta factura",
      success:false
      });
    } else {
      return res.status(200).json({ msg: "Monto accesible",success:true });
    }
  } catch (error) {
    console.error("Ha ocurrido un error al verificar el monto:", error);
    return res
      .status(500)
      .json({ msg: "Error al intentar verificar el monto " });
  }
};
const advertenciamontoModificar = async (req, res) => {
  const { _id, monto } = req.body;
  try {
    const contrato = await Contrato.findById(_id);
    const valorDisponibleReal = contrato.factura.monto + contrato.valorDisponible;
    if (valorDisponibleReal < monto) {
      return res.status(400).json({
        msg: "No hay suficiente valor disponible para registrar esta factura",
      success:false
      });
    } else {
      return res.status(200).json({ msg: "Monto accesible",success:true });
    }
  } catch (error) {
    console.error("Ha ocurrido un error al verificar el monto:", error);
    return res
      .status(500)
      .json({ msg: "Error al intentar verificar el monto " });
  }
};
const visualizaFactura = async (req, res) => {
  const { numeroDictamen } = req.body;
  
  try {
    const factura = await Factura.findOne({ numeroDictamen });
    if (!factura) {
      return res
        .status(404)
        .json({ msg: "No se encontró la factura solicitada" });
    }
    return res.status(200).json(factura);
  } catch (error) {
    console.error("Ha ocurrido un error al buscar la factura:", error);
    return res.status(500).json({ msg: "Error al intentar buscar la factura" });
  }
};

const modificarFactura = async (req, res) => {
  const { numeroDictamen, newNumeroDictamen, monto } = req.body;
  
  try {
    const factura = await Factura.findOne({ numeroDictamen });

    if (!factura) {
      return res
        .status(404)
        .json({ msg: "No se encontró la factura solicitada" });
    }
    const contrato = await Contrato.findOne({ _id: factura.contratoId });

    if (newNumeroDictamen && newNumeroDictamen!==numeroDictamen) {
      const exitenew = await Factura.findOne({
        numeroDictamen: newNumeroDictamen,
      });

      if (exitenew) {
        return res.status(400).json({
          msg: `No se pudo actualizar la  factura porque este numero de dictamen ${newNumeroDictamen} , ya existe otra factura`,
        });
      }
    }
    if (monto && newNumeroDictamen) {
    
      if (factura.monto > monto) {
        const diferencia = factura.monto - monto;
        contrato.valorDisponible += diferencia;
        contrato.valorGastado -= diferencia;
        
      } else {
        const diferencia = monto - factura.monto;
        contrato.valorDisponible -= diferencia;
        contrato.valorGastado += diferencia;
      }
      const facturaEncontrada = contrato.factura.find(
        (factura) => factura.numeroDictamen === numeroDictamen
      );
      facturaEncontrada.numeroDictamen = newNumeroDictamen;
      facturaEncontrada.monto = monto;
      factura.numeroDictamen = newNumeroDictamen;
      factura.monto = monto;
      await contrato.save();
      await factura.save();
      return res.status(200).json({ msg: "Factura modificada con éxito" });
    }
    if (monto && !newNumeroDictamen) {
      if (factura.monto > monto) {
        const diferencia = factura.monto - monto;
        contrato.valorDisponible += diferencia;
        contrato.valorGastado -= diferencia;
      } else {
        const diferencia = monto - factura.monto;
        contrato.valorDisponible -= diferencia;
        contrato.valorGastado += diferencia;
      }
      factura.monto = monto;
      await factura.save();
      await contrato.save();
      return res.status(200).json({ msg: "Factura modificada con éxito " });
    }
    const facturaEncontrada = contrato.factura.find(
      (factura) => factura.numeroDictamen === numeroDictamen
    );
    facturaEncontrada.numeroDictamen = newNumeroDictamen;
    factura.numeroDictamen = newNumeroDictamen;
    await contrato.save();
    await factura.save();
    return res.status(200).json({ msg: "Factura modificada con éxito" });
  } catch (error) {
    console.error("Ha ocurrido un error al modificar la factura:", error);
    return res
      .status(500)
      .json({ msg: "Error al intentar modificar la factura" });
  }
};

const eliminarFactura = async (req, res) => {
  try {
    const { numeroDictamen } = req.query; // Obtenemos el número de dictamen desde los query parameters
    const{contratoId}=req.params;
    // Buscamos la factura por número de dictamen
    const factura = await Factura.findOne({ numeroDictamen,contratoId });
    if (!factura) {
      return res.status(404).json({ msg: "Factura no encontrada" });
    }

    // Eliminamos la factura del servidor
    await factura.deleteOne();

    // Buscamos el contrato asociado
    const contrato = await Contrato.findOne({ _id: factura.contratoId });

    if (!contrato) {
      return res
        .status(404)
        .json({ msg: "No se encontró el contrato asociado" });
    }

    // Actualizamos los valores del contrato
    contrato.valorDisponible += factura.monto;
    contrato.valorGastado -= factura.monto;
    contrato.factura.pull({ numeroDictamen });

    await contrato.save();

    res.status(200).json({ msg: "Factura eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar la factura:", error);
    res.status(500).json({ msg: "Error al intentar eliminar la factura" });
  }
};

export {
  crearFactura,
  modificarFactura,
  visualizaFactura,
  eliminarFactura,
  advertenciamontoCrear,
  advertenciamontoModificar
};
