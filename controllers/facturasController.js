import { ipAddress, userAgent } from "../helpers/ipAndMetadata.js";
import guardarTraza from "../helpers/saveTraza.js";
import Contrato from "../models/Contratos.js";
import Factura from "../models/Factura.js";
import Notification from "../models/Notification.js";

// Función auxiliar para actualizar contratos marco
const actualizarContratosMarco = async (contratoEspecifico, montoCambio, operacion) => {
  try {
    // Buscar todos los contratos marco asociados a este contrato específico
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
          // En modificar, montoCambio será { anterior: X, nuevo: Y }
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
    throw error; // Re-lanzamos el error para manejarlo en la función principal
  }
};

const crearFactura = async (req, res) => {
  const { _id, numeroDictamen, monto } = req.body;
  const montoNumber = Number(monto);

  try {
    // Validar factura única
    const facturaNormalizada = numeroDictamen
      .normalize("NFD")
      .replace(/[\u0300-\u034F]/g, "")
      .toLowerCase()
      .trim();

    const existeFactura = await Factura.findOne({
      numeroDictamen: {
        $regex: new RegExp(`^${facturaNormalizada}$`, "i"),
      },
    });

    if (existeFactura) {
      return res.status(400).json({ msg: "La factura ya existe" });
    }

    // Obtener contrato y calcular total disponible
    const contrato = await Contrato.findById(_id);
    const totalDisponible =
      contrato.valorDisponible +
      contrato.supplement.reduce((sum, s) => sum + s.monto, 0);

    if (montoNumber > totalDisponible) {
      return res.status(400).json({
        msg: "El monto excede el presupuesto total (incluyendo suplementos)",
      });
    }

    // Variables para rastrear el monto usado de suplementos
    let montoRestante = montoNumber;
    let montoSuplementTotal = 0;

    // Paso 1: Descontar del valorDisponible
    const descuentoInicial = Math.min(contrato.valorDisponible, montoRestante);
    contrato.valorDisponible -= descuentoInicial;
    montoRestante -= descuentoInicial;
    contrato.valorGastado += descuentoInicial;

    // Paso 2: Descontar de suplementos (en orden)
    if (montoRestante > 0) {
      for (const suplemento of contrato.supplement) {
        if (montoRestante <= 0) break;

        const descuentoSuplemento = Math.min(suplemento.monto, montoRestante);
        suplemento.monto -= descuentoSuplemento;
        montoRestante -= descuentoSuplemento;
        contrato.valorGastado += descuentoSuplemento;
        montoSuplementTotal += descuentoSuplemento;
      }
    }

    // Crear factura y actualizar contrato
    const nuevaFactura = await Factura.create({
      contratoId: _id,
      numeroDictamen,
      monto: montoNumber,
      montoSuplement: montoSuplementTotal,
    });

    // Guardar en el array de facturas del contrato
    contrato.factura.push({
      numeroDictamen,
      monto: montoNumber,
      montoSuplement: montoSuplementTotal,
    });

    await contrato.save();

    // Si el contrato es específico, actualizar contratos marco asociados
    if (!contrato.isMarco) {
      await actualizarContratosMarco(contrato, montoNumber, 'crear');
    }

    // Actualizar notificación (si existe)
    const notificacion = await Notification.findOne({ contratoId: _id });
    if (notificacion) {
      notificacion.valorDisponible = contrato.valorDisponible;
      notificacion.supplement = contrato.supplement;
      await notificacion.save();
    }

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

const advertenciamontoCrear = async (req, res) => {
  const { _id, monto } = req.body;
  try {
    const contrato = await Contrato.findById(_id);
    if (contrato.valorDisponible < monto && contrato.supplement.length === 0) {
      return res.status(200).json({
        msg: "No hay suficiente presupuesto para registrar esta factura",
        success: false,
      });
    } else {
      return res.status(200).json({ msg: "Monto accesible", success: true });
    }
  } catch (error) {
    console.error("Ha ocurrido un error al verificar el monto:", error);
    return res
      .status(500)
      .json({ msg: "Error al intentar verificar el monto " });
  }
};

const advertenciamontoModificar = async (req, res) => {
  const { _id, numeroDictamen, monto } = req.body;

  try {
    const factura = await Factura.findOne({ numeroDictamen });
    if (!factura) {
      return res.status(404).json({ msg: "Factura no encontrada" });
    }

    const contrato = await Contrato.findById(_id);

    const totalDisponible =
      contrato.valorDisponible +
      contrato.supplement.reduce((sum, s) => sum + s.monto, 0) +
      factura.monto;

    if (monto > totalDisponible) {
      return res.status(400).json({
        msg: "El nuevo monto excede el presupuesto total disponible",
        success: false,
      });
    } else {
      return res.status(200).json({
        msg: "Monto accesible",
        success: true,
      });
    }
  } catch (error) {
    console.error("Error al verificar el monto:", error);
    return res.status(500).json({ msg: "Error interno del servidor" });
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
  const { numeroDictamen, newNumeroDictamen, monto: montoReq } = req.body;
  console.log("Iniciando modificación de factura:", numeroDictamen);

  try {
    // Validar y parsear monto
    let monto;
    if (montoReq !== undefined) {
      monto = parseInt(montoReq, 10);
      if (isNaN(monto)) {
        console.log("Monto inválido recibido:", montoReq);
        return res
          .status(400)
          .json({ msg: "Monto debe ser un número entero válido" });
      }
    }
    console.log("Monto parseado:", monto);

    // Buscar documentos
    const factura = await Factura.findOne({ numeroDictamen });
    if (!factura) {
      console.log("Factura no encontrada:", numeroDictamen);
      return res.status(404).json({ msg: "Factura no encontrada" });
    }
    console.log("Factura encontrada:", factura);

    const contrato = await Contrato.findById(factura.contratoId);
    if (!contrato) {
      console.log("Contrato no encontrado para factura:", factura._id);
      return res.status(404).json({ msg: "Contrato no encontrado" });
    }
    console.log("Contrato encontrado:", contrato._id);

    const notificaciones = await Notification.findOne({
      contratoId: contrato._id,
    });
    console.log("Notificación encontrada:", notificaciones ? "Sí" : "No");

    // Validar nuevo número de dictamen
    if (newNumeroDictamen && newNumeroDictamen !== factura.numeroDictamen) {
      const existeNew = await Factura.findOne({
        numeroDictamen: newNumeroDictamen,
      });
      if (existeNew) {
        console.log("Número de dictamen duplicado:", newNumeroDictamen);
        return res
          .status(400)
          .json({ msg: "El nuevo número de dictamen ya existe" });
      }
    }

    // Convertir valores antiguos
    const oldMonto = parseInt(factura.monto, 10);
    const oldMontoSuplement = parseInt(factura.montoSuplement, 10);
    console.log(
      "Valores antiguos - Monto:",
      oldMonto,
      "Suplemento:",
      oldMontoSuplement
    );

    // Procesar cambio de monto
    if (monto !== undefined && monto !== oldMonto) {
      console.log("Iniciando cambio de monto...");

      // 1. REINTEGRAR MONTO ANTERIOR
      console.log("Reintegrando monto anterior...");

      // Restaurar valor disponible
      const montoValorDisponible = oldMonto - oldMontoSuplement;
      contrato.valorDisponible += montoValorDisponible;
      contrato.valorGastado -= oldMonto;

      // Restaurar suplementos
      let remainingSuplement = oldMontoSuplement;
      console.log("Restaurando", remainingSuplement, "a suplementos");

      for (
        let i = contrato.supplement.length - 1;
        i >= 0 && remainingSuplement > 0;
        i--
      ) {
        const suplemento = contrato.supplement[i];
        const maxDevolucion = suplemento.montoOriginal - suplemento.monto;
        const devolucion = Math.min(maxDevolucion, remainingSuplement);

        suplemento.monto += devolucion;
        remainingSuplement -= devolucion;
        console.log(
          `Devolución ${devolucion} al suplemento ${i}, restante: ${remainingSuplement}`
        );
      }

      if (remainingSuplement > 0) {
        console.log(
          "Agregando nuevo suplemento por remanente:",
          remainingSuplement
        );
        contrato.supplement.push({
          monto: remainingSuplement,
          montoOriginal: remainingSuplement,
        });
      }

      // 2. VALIDAR NUEVO MONTO
      const totalDisponible =
        contrato.valorDisponible +
        contrato.supplement.reduce((sum, s) => sum + s.monto, 0);

      console.log(
        "Total disponible después de reintegración:",
        totalDisponible
      );

      if (monto > totalDisponible) {
        console.log("Monto excede disponible:", monto, ">", totalDisponible);
        return res.status(400).json({
          msg: "El nuevo monto excede el presupuesto total disponible",
        });
      }

      // 3. APLICAR NUEVO MONTO
      console.log("Aplicando nuevo monto...");
      let montoRestante = monto;
      let montoSuplementTotal = 0;

      // Paso 1: Descontar de valorDisponible
      const descuentoInicial = Math.min(
        contrato.valorDisponible,
        montoRestante
      );
      contrato.valorDisponible -= descuentoInicial;
      montoRestante -= descuentoInicial;
      console.log(
        "Descuento inicial:",
        descuentoInicial,
        "Restante:",
        montoRestante
      );

      // Paso 2: Descontar de suplementos
      if (montoRestante > 0) {
        console.log("Descontando de suplementos...");
        for (const suplemento of contrato.supplement) {
          if (montoRestante <= 0) break;

          const descuentoSuplemento = Math.min(suplemento.monto, montoRestante);
          suplemento.monto -= descuentoSuplemento;
          montoRestante -= descuentoSuplemento;
          montoSuplementTotal += descuentoSuplemento;
          console.log(
            "Descontado de suplemento:",
            descuentoSuplemento,
            "Restante:",
            montoRestante
          );
        }
      }

      // Actualizar valores
      contrato.valorGastado += monto;
      factura.monto = monto;
      factura.montoSuplement = montoSuplementTotal;

      // Actualizar en array del contrato
      const facturaContrato = contrato.factura.find((f) =>
        f._id.equals(factura._id)
      );
      if (facturaContrato) {
        facturaContrato.monto = monto;
        facturaContrato.montoSuplement = montoSuplementTotal;
        console.log("Actualizado en array de facturas del contrato");
      }

      // Si el contrato es específico, actualizar contratos marco asociados
      if (!contrato.isMarco) {
        await actualizarContratosMarco(contrato, { anterior: oldMonto, nuevo: monto }, 'modificar');
      }
    }

    // Actualizar número de dictamen
    if (newNumeroDictamen) {
      console.log("Actualizando número de dictamen...");
      factura.numeroDictamen = newNumeroDictamen;
      const facturaContrato = contrato.factura.find((f) =>
        f._id.equals(factura._id)
      );
      if (facturaContrato) {
        facturaContrato.numeroDictamen = newNumeroDictamen;
        console.log("Número actualizado en array del contrato");
      }
    }

    // Guardar cambios
    console.log("Guardando cambios...");
    await contrato.save();
    await factura.save();
    console.log("Cambios guardados exitosamente");

    // Actualizar notificación
    if (notificaciones) {
      notificaciones.valorDisponible = contrato.valorDisponible;
      notificaciones.supplement = contrato.supplement;
      await notificaciones.save();
      console.log("Notificación actualizada");
    }

    await guardarTraza({
      entity_name: "Factura",
      entity_id: factura._id,
      old_value: JSON.stringify({
        numeroDictamen: numeroDictamen,
        monto: oldMonto,
        montoSuplement: oldMontoSuplement,
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

const eliminarFactura = async (req, res) => {
  try {
    const { numeroDictamen } = req.query;
    const { contratoId } = req.params;
    
    // Buscar factura y contrato
    const factura = await Factura.findOne({ numeroDictamen });
    if (!factura) {
      return res.status(404).json({ msg: "Factura no encontrada" });
    }

    const contrato = await Contrato.findById(contratoId);
    if (!contrato) {
      return res.status(404).json({ msg: "Contrato no encontrado" });
    }

    const notificaciones = await Notification.findOne({ contratoId });

    // Variables clave
    const montoSuplement = factura.montoSuplement;
    const montoValorDisponible = factura.monto - montoSuplement;

    // Restaurar suplementos
    let remainingSuplement = montoSuplement;
    for (
      let i = contrato.supplement.length - 1;
      i >= 0 && remainingSuplement > 0;
      i--
    ) {
      const suplemento = contrato.supplement[i];
      const maxDevolucion = suplemento.montoOriginal - suplemento.monto;
      const devolucion = Math.min(maxDevolucion, remainingSuplement);
      suplemento.monto += devolucion;
      remainingSuplement -= devolucion;
    }

    // Si aún queda monto, agregar como nuevo suplemento
    if (remainingSuplement > 0) {
      contrato.supplement.push({ monto: remainingSuplement });
    }

    // Restaurar valorDisponible y actualizar valores
    contrato.valorDisponible += montoValorDisponible;
    contrato.valorGastado -= factura.monto;
    contrato.factura.pull({ numeroDictamen: factura.numeroDictamen });

    // Eliminar factura y guardar cambios
    await factura.deleteOne();
    await contrato.save();

    // Si el contrato es específico, actualizar contratos marco asociados
    if (!contrato.isMarco) {
      await actualizarContratosMarco(contrato, factura.monto, 'eliminar');
    }

    // Actualizar notificación
    if (notificaciones) {
      notificaciones.valorDisponible = contrato.valorDisponible;
      await notificaciones.save();
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
  advertenciamontoModificar,
};