import calcularFechaFin from "../helpers/calcularFecha.js";
import { eliminarArchivoAnterior } from "../middleware/archivosubidor.js";
import Contrato from "../models/Contratos.js";
import path from "path";
import Factura from "../models/Factura.js";
const registrarContrato = async (req, res) => {
  const { usuario } = req;
  if(req.body.subirPDF){
  const subirPDF = `/documents/contracts/${req.file.filename}`;
}  
// Extraer datos del cuerpo de la solicitud
  const {
    numeroDictamen,
    tipoDeContrato,
    objetoDelContrato,
    entidad,
    direccionEjecuta,
    fechaRecibido,
    valor,
    vigencia,
    estado,
    aprobadoPorCC,
    firmado,
    entregadoJuridica,
  } = req.body;
  // Crear un nuevo contrato

  const direccionEjecutaParceada = direccionEjecuta.toLowerCase();
  try {
    const contrato = await Contrato.findOne({ numeroDictamen });
    if (contrato) {
      return res
        .status(403)
        .json({ msg: `El registro del contrato ${numeroDictamen} ya existe` });
    }

    if (
      usuario.tipo_usuario === "Admin_Ser" ||
      usuario.tipo_usuario === "Espe_Ser"
    ) {
      if (direccionEjecutaParceada !== "servicios") {
        return res.status(400).json({
          msg: `Solo tienes acceso a crear contratos por la Dirección de Servicios Generales`,
        });
      }
    }
    if (
      usuario.tipo_usuario === "Admin_Mant" ||
      usuario.tipo_usuario === "Espe_Mant"
    ) {
      if (
        direccionEjecutaParceada !== "inversiones" &&
        direccionEjecutaParceada !== "mantenimiento"
      ) {
        return res.status(400).json({
          msg: `Solo tienes acceso a crear contratos por la Dirección de Mantenimiento e Inversones`,
        });
      }
    }
    let newContrato;
    if(req.body.subirPDF){
    newContrato = new Contrato({
      tipoDeContrato,
      objetoDelContrato,
      entidad,
      direccionEjecuta,
      fechaRecibido,
      valor,
      valorDisponible: valor,
      vigencia,
      fechaVencimiento: calcularFechaFin(fechaRecibido, vigencia),
      estado,
      aprobadoPorCC,
      firmado,
      entregadoJuridica,
      numeroDictamen,
      subirPDF,
      info: 
          {
            creadoPor: usuario.nombre,
            fechaDeCreacion: new Date().toISOString(),
            modificadoPor: usuario.nombre,
            fechaDeModificacion: new Date().toISOString(),
          },
    });} else{
       newContrato = new Contrato({
        tipoDeContrato,
        objetoDelContrato,
        entidad,
        direccionEjecuta,
        fechaRecibido,
        valor,
        valorDisponible: valor,
        vigencia,
        fechaVencimiento: calcularFechaFin(fechaRecibido, vigencia),
        estado,
        aprobadoPorCC,
        firmado,
        entregadoJuridica,
        numeroDictamen,
        info: 
          {
            creadoPor: usuario.nombre,
            fechaDeCreacion: new Date().toISOString(),
            modificadoPor: usuario.nombre,
            fechaDeModificacion: new Date().toISOString(),
          },
    
      });
    }
    // Guardar el contrato en la base de datos
    await newContrato.save();

    return res
      .status(200)
      .json({ message: "Contrato registrado exitosamente" });
  } catch (error) {
    console.error("Error al registrar contrato:", error);
    return res.status(500).json({ error: "Error al registrar contrato" });
  }
};

const obtenerRegistroContratos = async (req, res) => {
  const { usuario } = req;
  try {
    if (["Admin_Ser", "Espe_Ser"].includes(usuario.tipo_usuario)) {
      const contratos = await Contrato.find({ direccionEjecuta: "Servicios" });
      return res.status(200).json(contratos);
    }
    if (["Admin_Mant", "Espe_Mant"].includes(usuario.tipo_usuario)) {
      const contratos = await Contrato.find({
        direccionEjecuta: "Mantenimiento",
        direccionEjecuta: "Inversiones",
      });
      return res.status(200).json(contratos);
    }
    const allcontract = await Contrato.find();
    return res.status(200).json(allcontract);
  } catch (error) {
    console.error("Error al obtener registros de contratos:", error);
    return res
      .status(500)
      .json({ msg: "Ocurrio un error al listar los  contratos" });
  }
};
const actualizarRegistroContrato = async (req, res) => {
  const { id } = req.params;
 const{usuario}=req;
  const bodyRest = { ...req.body};
  delete bodyRest.subirPDF;
  console.log(bodyRest)
  let pdfNew;
  if (req.body.subirPDF) {
    pdfNew = `/documents/contracts/${req.file.filename}`;

    const extension = path.extname(req.file.filename).toLowerCase();
    // Verificar si la extensión coincide con lo permitido
    const allowedExtensions = [".pdf"];
    if (!allowedExtensions.includes(extension)) {
      const ruta = `./public/documents/contracts/${req.file.filename}`;
      eliminarArchivoAnterior(ruta);
      return res.status(400).json({ msg: "Solo se permiten archivos PDF" });
    }
  }
  try {
    const contrato = await Contrato.findById(id);
    if (!contrato) {
      return res.status(404).json({ msg: "Contrato no encontrado" });
    }
    if (req.body.valor) {
      if (req.body.valor < contrato.valorGastado) {
        return res.status(400).json({
          msg: "El valor del contrato no puede ser menor que el valor  gastado",
        });
      }
    }
    if (req.body.fechaRecibido) {
      // Otra forma de obtener la fecha actual
      const fechaparce = new Date().toISOString();

      if (req.body.fechaRecibido > fechaparce) {
        return res.status(400).json({
          msg: "La fecha de recepción no puede ser  mayor a la fecha actual",
        });
      }
    }

    if (!pdfNew) {
      await contrato.updateOne({ $set: bodyRest,'info.modificadoPor': usuario.nombre,
        'info.fechaDeModificacion': new Date().toISOString(),
     }, { 
        new: true,
      });
      if (req.body.valor) {
        contrato.valorDisponible = req.body.valor - contrato.valorGastado;
      }
      if (req.body.fechaRecibido) {
        contrato.fechaVencimiento = calcularFechaFin(
          contrato.fechaRecibido,
          contrato.vigencia
        ); 
      }
      await contrato.save();
      return res.status(200).json({ msg: "Contrato actualizado exitosamente",contrato });
    }
    await contrato.updateOne(
      { $set: bodyRest,'info.1.modificadoPor': usuario.nombre,
          'info.1.fechaDeModificacion': new Date().toISOString(),
       },
      { $unset: { subirPDF: pdfNew } },
      { new: true }
    );

    if (req.body.valor) {
      contrato.valorDisponible = req.body.valor - valorGastado;
    }
    if (req.body.fechaRecibido) {
      contrato.fechaVencimiento = calcularFechaFin(
        contrato.fechaRecibido,
        contrato.vigencia
      );
    }
    await contrato.save();
    return res.status(200).json({ msg: "Contrato actualizado exitosamente" });
  } catch (error) {
    console.error("Ha ocurrido un error al actualizar:", error);
    return res
      .status(500)
      .json({ msg: "Error al intentar actualizar el registro" });
  }
};

const eliminarRegistroContrato = async (req, res) => {
  const { id } = req.params;
  try {
    const contrato = await Contrato.findById(id);
    if (!contrato) {
      return res.status(404).json({ msg: "Contrato no encontrado" });
    }
    const facturas = await Factura.find({ contratoId: id });
    if (facturas.length > 0) {
      await Factura.deleteMany({ contratoId: id });
    }
    await contrato.deleteOne();
    return res.status(200).json({ msg: "Contrato eliminado exitosamente" });
  } catch (error) {
    console.error("Ha ocurrido un error al eliminar:", error);
    return res
      .status(500)
      .json({ msg: "Error al intentar eliminar el registro" });
  }
};

const obtenerContratosPorEntidad = async (req, res) => {
  const { entidad } = req.params;
  try {
    const contratos = await Contrato.find({ entidad });
    return res.status(200).json(contratos);
  } catch (error) {
    console.error("Ha ocurrido un error al obtener los contratos:", error);
    return res
      .status(500)
      .json({ msg: "Error al intentar obtener los contratos" });
  }
};

const obtenerContratosPorEstado = async (req, res) => {
  const { estado } = req.params;
  try {
    const contratos = await Contrato.find({ estado });
    return res.status(200).json(contratos);
  } catch (error) {
    console.error("Ha ocurrido un error al obtener los contratos:", error);
    return res
      .status(500)
      .json({ msg: "Error al intentar obtener los contratos" });
  }
};

const obtenerContratosPorDireccion = async (req, res) => {
  const { direccionEjecuta } = req.params;
  console.log(direccionEjecuta);
  try {
    const contratos = await Contrato.find({ direccionEjecuta });
    console.log(contratos);
    return res.status(200).json(contratos);
  } catch (error) {
    console.error("Ha ocurrido un error al obtener los contratos:", error);
    return res
      .status(500)
      .json({ msg: "Error al intentar obtener los contratos" });
  }
};

const obtenerContratosPorValorTotal = async (req, res) => {
  const { valor, tipo, valorFin } = req.params;
  try {
    if (tipo === "menore") {
      const contratos = await Contrato.find({ valor })
        .where("valor")
        .lte(valor);
      return res.status(200).json(contratos);
    }
    if (tipo === "mayore") {
      const contratos = await Contrato.find({ valor })
        .where("valor")
        .gte(valor);
      return res.status(200).json(contratos);
    }
    if (tipo === "entre") {
      const contratos = await Contrato.find({ valor })
        .where("valor")
        .gte(valor)
        .lte(valorFin);
      return res.status(200).json(contratos);
    }
  } catch (error) {
    console.error("Ha ocurrido un error al obtener los contratos:", error);
    return res
      .status(500)
      .json({ msg: "Error al intentar obtener los contratos" });
  }
};

const obtenerContratosPorValorDisponible = async (req, res) => {
  const { valorDisponible, tipo, valorFin } = req.params;
  try {
    if (tipo === "menore") {
      const contratos = await Contrato.find({ valorDisponible })
        .where("valorDisponible")
        .lte(valorDisponible);
      return res.status(200).json(contratos);
    }
    if (tipo === "mayore") {
      const contratos = await Contrato.find({ valorDisponible })
        .where("valorDisponible")
        .gte(valorDisponible);
      return res.status(200).json(contratos);
    }
    if (tipo === "entre") {
      const contratos = await Contrato.find({ valorDisponible })
        .where("valorDisponible")
        .gte(valorDisponible)
        .lte(valorFin);
      return res.status(200).json(contratos);
    }
  } catch (error) {
    console.error("Ha ocurrido un error al obtener los contratos:", error);
    return res
      .status(500)
      .json({ msg: "Error al intentar obtener los contratos" });
  }
};
const obtenerContratosPorValorGastado = async (req, res) => {
  const { valorGastado, tipo, valorFin } = req.params;
  try {
    if (tipo === "menore") {
      const contratos = await Contrato.find({ valorGastado })
        .where("valorGastado")
        .lte(valorGastado);
      return res.status(200).json(contratos);
    }
    if (tipo === "mayore") {
      const contratos = await Contrato.find({ valorGastado })
        .where("valorGastado")
        .gte(valorGastado);
      return res.status(200).json(contratos);
    }
    if (tipo === "entre") {
      const contratos = await Contrato.find({ valorGastado })
        .where("valorGastado")
        .gte(valorGastado)
        .lte(valorFin);
      return res.status(200).json(contratos);
    }
  } catch (error) {
    console.error("Ha ocurrido un error al obtener los contratos:", error);
    return res
      .status(500)
      .json({ msg: "Error al intentar obtener los contratos" });
  }
};


const notificarcontratos = async(req,res)=>{
  const{usuario}=req;
  try {
    let contratos;
    const hoy = new Date();
    const fechaLimite = new Date(hoy);
    fechaLimite.setDate(hoy.getDate() + 30); // Fecha límite para los contratos que están por vencer

    // Filtrar contratos según el tipo de usuario
    if (usuario.tipo_usuario === "Admin_Mant" || usuario.tipo_usuario === "Espe_Mant") {
      contratos = await Contrato.find({
        direccionEjecuta: { $in: ['Mantenimiento', 'Inversiones'] },
        fechaVencimiento: { $gte: hoy, $lte: fechaLimite } // Contratos que van a vencer en 30 días
      });
      // Crear el objeto de respuesta con el número de dictamen y días de vencimiento
    const contratosRespuesta = contratos.map(contrato => ({
      numeroDictamen: contrato.numeroDictamen,
      diasVencimiento: Math.ceil((contrato.fechaVencimiento - hoy) / (1000 * 60 * 60 * 24)) // Cálculo de días restantes
    }));

    // Responder con los contratos que están por vencer
    return res.status(200).json(contratosRespuesta);
    } 
     if (usuario.tipo_usuario === "Admin_Ser" || usuario.tipo_usuario === "Espe_Ser") {
      contratos = await Contrato.find({
        direccionEjecuta: 'Servicios',
        fechaVencimiento: { $gte: hoy, $lte: fechaLimite } // Contratos que van a vencer en 30 días
      });
      // Crear el objeto de respuesta con el número de dictamen y días de vencimiento
    const contratosRespuesta = contratos.map(contrato => ({
      numeroDictamen: contrato.numeroDictamen,
      diasVencimiento: Math.ceil((contrato.fechaVencimiento - hoy) / (1000 * 60 * 60 * 24)) // Cálculo de días restantes
    }));

    // Responder con los contratos que están por vencer
    return res.status(200).json(contratosRespuesta);
    } 

      // Acceso completo a todos los contratos que están por vencer
      contratos = await Contrato.find({
        fechaVencimiento: { $gte: hoy, $lte: fechaLimite } // Contratos que van a vencer en 30 días
      });
    
    
    // Crear el objeto de respuesta con el número de dictamen y días de vencimiento
    const contratosRespuesta = contratos.map(contrato => ({
      numeroDictamen: contrato.numeroDictamen,
      diasVencimiento: Math.ceil((contrato.fechaVencimiento - hoy) / (1000 * 60 * 60 * 24)) // Cálculo de días restantes
    }));

    // Responder con los contratos que están por vencer
    return res.status(200).json(contratosRespuesta);
  } catch (error) {
    console.error("Ha ocurrido un error al obtener los contratos:", error);
    return res
      .status(500)
      .json({ msg: "Error al intentar obtener los contratos" });
  }
  
 
}
export {
  registrarContrato,
  obtenerRegistroContratos,
  actualizarRegistroContrato,
  eliminarRegistroContrato,
  obtenerContratosPorEntidad,
  obtenerContratosPorEstado,
  obtenerContratosPorDireccion,
  obtenerContratosPorValorTotal,
  obtenerContratosPorValorDisponible,
  obtenerContratosPorValorGastado,
  notificarcontratos
};
