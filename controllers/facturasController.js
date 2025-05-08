import { ipAddress, userAgent } from "../helpers/ipAndMetadata.js";
import guardarTraza from "../helpers/saveTraza.js";
import Contrato from "../models/Contratos.js";
import Factura from "../models/Factura.js";
import Notification from "../models/Notification.js";

// Función auxiliar para actualizar contratos marco (simplificada)
const actualizarContratosMarco = async (contratoEspecifico, montoCambio, operacion) => {
  try {
    const contratosMarco = await Contrato.find({
      "especificos": contratoEspecifico._id,
      "isMarco": true
    });

    for (const contratoMarco of contratosMarco) {
      switch (operacion) {
        case 'crear':
          contratoMarco.valorGastado += montoCambio;
          contratoMarco.valorDisponible -= montoCambio;
          break;

        case 'modificar':
          const diferencia = montoCambio.nuevo - montoCambio.anterior;
          contratoMarco.valorGastado += diferencia;
          contratoMarco.valorDisponible -= diferencia;
          break;

        case 'eliminar':
          contratoMarco.valorGastado -= montoCambio;
          contratoMarco.valorDisponible += montoCambio;
          break;
      }
      await contratoMarco.save();
    }
  } catch (error) {
    console.error("Error al actualizar contratos marco:", error);
    throw error;
  }
};

// Crear Factura (Versión Simplificada)
const crearFactura = async (req, res) => {
  const { _id, numeroDictamen, monto } = req.body;
  const montoNumber = Number(monto);

  try {
    // Validar factura única
    const facturaNormalizada = numeroDictamen.normalize("NFD").replace(/[\u0300-\u034F]/g, "").toLowerCase().trim();
    const existeFactura = await Factura.findOne({ numeroDictamen: { $regex: new RegExp(`^${facturaNormalizada}$`, "i") } });
    if (existeFactura) return res.status(400).json({ msg: "La factura ya existe" });

    // Obtener contrato
    const contrato = await Contrato.findById(_id);
    if (!contrato) return res.status(404).json({ msg: "Contrato no encontrado" });

    // Calcular total disponible (valorDisponible + suplementos)
    const totalDisponible = contrato.valorDisponible + contrato.supplement.reduce((sum, s) => sum + s.monto, 0);

    if (montoNumber > totalDisponible) {
      return res.status(400).json({ msg: "El monto excede el presupuesto total" });
    }

    // Procesar el pago
    let montoRestante = montoNumber;
    let montoSuplement = 0;

    // 1. Usar valorDisponible local
    const descuentoInicial = Math.min(contrato.valorDisponible, montoRestante);
    contrato.valorDisponible -= descuentoInicial;
    montoRestante -= descuentoInicial;

    // 2. Usar suplementos locales
    if (montoRestante > 0) {
      for (const sup of contrato.supplement) {
        if (montoRestante <= 0) break;
        const descuento = Math.min(sup.monto, montoRestante);
        sup.monto -= descuento;
        montoRestante -= descuento;
        montoSuplement += descuento;
      }
    }

    // Crear factura
    const nuevaFactura = await Factura.create({
      contratoId: _id,
      numeroDictamen,
      monto: montoNumber,
      montoSuplement
    });

    // Actualizar contrato
    contrato.factura.push({ numeroDictamen, monto: montoNumber, montoSuplement });
    contrato.valorGastado += (descuentoInicial + montoSuplement);
    await contrato.save();

    // Actualizar contrato marco si es específico
    if (!contrato.isMarco) {
      await actualizarContratosMarco(contrato, montoNumber, 'crear');
    }

    // Guardar traza
    await guardarTraza({
      entity_name: "Factura",
      entity_id: nuevaFactura._id,
      new_value: JSON.stringify(nuevaFactura.toObject()),
      action_type: "INSERTAR",
      changed_by: req.usuario.nombre,
      ip_address: ipAddress(req),
      session_id: req.sessionID,
      metadata: userAgent(req),
    });

    return res.status(200).json({ msg: "Factura creada exitosamente" });
  } catch (error) {
    console.error("Error al crear la factura:", error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

// Eliminar Factura (Versión Simplificada)
const eliminarFactura = async (req, res) => {
  try {
    const { numeroDictamen } = req.query;
    const { contratoId } = req.params;

    const factura = await Factura.findOne({ numeroDictamen });
    if (!factura) return res.status(404).json({ msg: "Factura no encontrada" });

    const contrato = await Contrato.findById(contratoId);
    if (!contrato) return res.status(404).json({ msg: "Contrato no encontrado" });

    // Reintegrar montos
    contrato.valorDisponible += (factura.monto - factura.montoSuplement);
    
    // Reintegrar suplementos
    let remaining = factura.montoSuplement;
    for (let i = contrato.supplement.length - 1; i >= 0 && remaining > 0; i--) {
      const sup = contrato.supplement[i];
      const maxDevolucion = sup.montoOriginal - sup.monto;
      const devolucion = Math.min(maxDevolucion, remaining);
      sup.monto += devolucion;
      remaining -= devolucion;
    }

    // Actualizar contrato
    contrato.factura.pull({ _id: factura._id });
    contrato.valorGastado -= factura.monto;
    await contrato.save();
    await factura.deleteOne();

    // Actualizar contrato marco si es específico
    if (!contrato.isMarco) {
      await actualizarContratosMarco(contrato, factura.monto, 'eliminar');
    }

    await guardarTraza({
      entity_name: "Factura",
      entity_id: factura._id,
      old_value: JSON.stringify(factura.toObject()),
      action_type: "ELIMINAR",
      changed_by: req.usuario.nombre,
      ip_address: ipAddress(req),
      session_id: req.sessionID,
      metadata: userAgent(req),
    });

    return res.status(200).json({ msg: "Factura eliminada con éxito" });
  } catch (error) {
    console.error("Error al eliminar la factura:", error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

const modificarFactura = async (req, res) => {
  const { numeroDictamen, newNumeroDictamen, monto: montoReq } = req.body;

  try {
    // Validar y parsear monto
    let monto;
    if (montoReq !== undefined) {
      monto = parseInt(montoReq, 10);
      if (isNaN(monto)) {
        return res.status(400).json({ msg: "Monto debe ser un número válido" });
      }
    }

    // Buscar factura y contrato
    const factura = await Factura.findOne({ numeroDictamen });
    if (!factura) return res.status(404).json({ msg: "Factura no encontrada" });

    const contrato = await Contrato.findById(factura.contratoId);
    if (!contrato) return res.status(404).json({ msg: "Contrato no encontrado" });

    // Validar nuevo número de dictamen
    if (newNumeroDictamen && newNumeroDictamen !== factura.numeroDictamen) {
      const existeNew = await Factura.findOne({ numeroDictamen: newNumeroDictamen });
      if (existeNew) return res.status(400).json({ msg: "El nuevo número de dictamen ya existe" });
    }

    // Guardar valores antiguos para reintegro
    const oldMonto = factura.monto;
    const oldMontoSuplement = factura.montoSuplement || 0;

    // Procesar cambio de monto
    if (monto !== undefined && monto !== oldMonto) {
      // 1. REINTEGRAR MONTO ANTERIOR
      // Reintegrar suplementos
      let remaining = oldMontoSuplement;
      for (let i = contrato.supplement.length - 1; i >= 0 && remaining > 0; i--) {
        const sup = contrato.supplement[i];
        const maxDevolucion = sup.montoOriginal - sup.monto;
        const devolucion = Math.min(maxDevolucion, remaining);
        sup.monto += devolucion;
        remaining -= devolucion;
      }

      // Reintegrar valorDisponible
      contrato.valorDisponible += (oldMonto - oldMontoSuplement);
      contrato.valorGastado -= oldMonto;

      // 2. VALIDAR NUEVO MONTO
      const totalDisponible = contrato.valorDisponible + contrato.supplement.reduce((sum, s) => sum + s.monto, 0);

      if (monto > totalDisponible) {
        return res.status(400).json({ msg: "El nuevo monto excede el presupuesto disponible" });
      }

      // 3. APLICAR NUEVO MONTO
      let montoRestante = monto;
      let montoSuplement = 0;

      // Paso 1: Usar valorDisponible
      const descuentoInicial = Math.min(contrato.valorDisponible, montoRestante);
      contrato.valorDisponible -= descuentoInicial;
      montoRestante -= descuentoInicial;

      // Paso 2: Usar suplementos
      if (montoRestante > 0) {
        for (const sup of contrato.supplement) {
          if (montoRestante <= 0) break;
          const descuento = Math.min(sup.monto, montoRestante);
          sup.monto -= descuento;
          montoRestante -= descuento;
          montoSuplement += descuento;
        }
      }

      // Actualizar factura
      factura.monto = monto;
      factura.montoSuplement = montoSuplement;

      // Actualizar contrato
      contrato.valorGastado += monto;
    }

    // Actualizar número de dictamen si cambió
    if (newNumeroDictamen) {
      factura.numeroDictamen = newNumeroDictamen;
      const facturaInContrato = contrato.factura.find(f => f._id.equals(factura._id));
      if (facturaInContrato) facturaInContrato.numeroDictamen = newNumeroDictamen;
    }

    // Guardar cambios
    await contrato.save();
    await factura.save();

    // Actualizar contrato marco si es específico
    if (!contrato.isMarco) {
      await actualizarContratosMarco(
        contrato,
        { anterior: oldMonto, nuevo: monto },
        'modificar'
      );
    }

    // Guardar traza
    await guardarTraza({
      entity_name: "Factura",
      entity_id: factura._id,
      old_value: JSON.stringify({
        numeroDictamen,
        monto: oldMonto,
        montoSuplement: oldMontoSuplement
      }),
      new_value: JSON.stringify(factura.toObject()),
      action_type: "ACTUALIZAR",
      changed_by: req.usuario.nombre,
      ip_address: ipAddress(req),
      session_id: req.sessionID,
      metadata: userAgent(req),
    });

    return res.status(200).json({ msg: "Factura modificada exitosamente" });
  } catch (error) {
    console.error("Error en modificarFactura:", error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

const visualizaFactura = async (req, res) => {
  const { numeroDictamen } = req.body;

  try {
    const factura = await Factura.findOne({ numeroDictamen })
      .populate({
        path: "contratoId",
        select: "numeroDictamen tipoDeContrato isMarco"
      });
      
    if (!factura) {
      
      return res.status(404).json({ msg: "No se encontró la factura solicitada" });
    }

    return res.status(200).json(factura);
  } catch (error) {
    console.error("Error al buscar la factura:", error);
    return res.status(500).json({ msg: "Error al intentar buscar la factura" });
  }
};

const advertenciamontoCrear = async (req, res) => {
  const { _id, monto } = req.body;
  
  try {
    const contrato = await Contrato.findById(_id);
    if (!contrato) return res.status(404).json({ msg: "Contrato no encontrado" });

    // Calcular total disponible
    const totalDisponible = contrato.valorDisponible + contrato.supplement.reduce((sum, s) => sum + s.monto, 0);

    if (monto > totalDisponible) {
      return res.status(200).json({
        msg: "No hay suficiente presupuesto para registrar esta factura",
        success: false,
        disponible: totalDisponible
      });
    } else {
      return res.status(200).json({ 
        msg: "Monto accesible", 
        success: true,
        disponible: totalDisponible
      });
    }
  } catch (error) {
    console.error("Error al verificar el monto:", error);
    return res.status(500).json({ msg: "Error al intentar verificar el monto" });
  }
};

const advertenciamontoModificar = async (req, res) => {
  const { _id, numeroDictamen, monto } = req.body;

  try {
    const factura = await Factura.findOne({ numeroDictamen });
    if (!factura) return res.status(404).json({ msg: "Factura no encontrada" });

    const contrato = await Contrato.findById(_id);
    if (!contrato) return res.status(404).json({ msg: "Contrato no encontrado" });

    // Calcular total disponible (incluyendo reintegro del monto actual)
    const totalDisponible = contrato.valorDisponible + 
                          contrato.supplement.reduce((sum, s) => sum + s.monto, 0) + 
                          (factura.monto - factura.montoSuplement);

    if (monto > totalDisponible) {
      return res.status(400).json({
        msg: "El nuevo monto excede el presupuesto total disponible",
        success: false,
        disponible: totalDisponible
      });
    } else {
      return res.status(200).json({
        msg: "Monto accesible",
        success: true,
        disponible: totalDisponible
      });
    }
  } catch (error) {
    console.error("Error al verificar el monto:", error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

export {
  crearFactura,
  modificarFactura,
  visualizaFactura,
  eliminarFactura,
  advertenciamontoCrear,
  advertenciamontoModificar,
};