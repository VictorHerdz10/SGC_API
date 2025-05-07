import { ipAddress, userAgent } from "../helpers/ipAndMetadata.js";
import guardarTraza from "../helpers/saveTraza.js";
import Contrato from "../models/Contratos.js";
import Factura from "../models/Factura.js";
import Notification from "../models/Notification.js";

<<<<<<< HEAD
// Función auxiliar para actualizar contratos marco
const actualizarContratosMarco = async (contratoEspecifico, montoCambio, operacion, supplementId = null) => {
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
          
          if (supplementId) {
            const supplement = contratoMarco.supplement.id(supplementId);
            if (supplement && supplement.isGlobal) {
              supplement.usedBy.push({
                contratoId: contratoEspecifico._id,
                montoUsado: montoCambio
              });
            }
          }
          break;

        case 'modificar':
          const diferencia = montoCambio.nuevo - montoCambio.anterior;
          contratoMarco.valorGastado += diferencia;
          contratoMarco.valorDisponible -= diferencia;
          break;

        case 'eliminar':
          contratoMarco.valorGastado -= montoCambio;
          contratoMarco.valorDisponible += montoCambio;
          
          if (supplementId) {
            const supplement = contratoMarco.supplement.id(supplementId);
            if (supplement && supplement.isGlobal) {
              supplement.monto += montoCambio;
              supplement.usedBy = supplement.usedBy.filter(
                use => !use.contratoId.equals(contratoEspecifico._id)
              );
            }
          }
          break;
      }
      await contratoMarco.save();
    }
  } catch (error) {
    console.error("Error al actualizar contratos marco:", error);
    throw error;
  }
};

// Crear Factura (Versión Completa)
=======
>>>>>>> parent of b5bab00 (update facturas)
const crearFactura = async (req, res) => {
  const { _id, numeroDictamen, monto, supplementId } = req.body;
  const montoNumber = Number(monto);

  try {
    // Validar factura única
    const facturaNormalizada = numeroDictamen.normalize("NFD").replace(/[\u0300-\u034F]/g, "").toLowerCase().trim();
    const existeFactura = await Factura.findOne({ numeroDictamen: { $regex: new RegExp(`^${facturaNormalizada}$`, "i") } });
    if (existeFactura) return res.status(400).json({ msg: "La factura ya existe" });

    // Obtener contrato y suplementos
    const contrato = await Contrato.findById(_id);
    let contratoMarco = null;
    let supplementGlobal = null;

<<<<<<< HEAD
    if (!contrato.isMarco) {
      contratoMarco = await Contrato.findOne({ "especificos": contrato._id, "isMarco": true });
      if (supplementId && contratoMarco) {
        supplementGlobal = contratoMarco.supplement.id(supplementId);
      }
    }

    // Calcular total disponible (local + global)
    const totalLocal = contrato.valorDisponible + contrato.supplement.reduce((sum, s) => sum + s.monto, 0);
    const totalGlobal = supplementGlobal ? supplementGlobal.monto : 0;
    const totalDisponible = totalLocal + totalGlobal;

    if (montoNumber > totalDisponible) {
      return res.status(400).json({ msg: "El monto excede el presupuesto total" });
    }

    // Procesar el pago
    let montoRestante = montoNumber;
    let montoSuplementLocal = 0;
    let montoSuplementGlobal = 0;

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
        montoSuplementLocal += descuento;
      }
    }

    // 3. Usar suplemento global (si existe)
    if (montoRestante > 0 && supplementGlobal) {
      const descuento = Math.min(supplementGlobal.monto, montoRestante);
      supplementGlobal.monto -= descuento;
      montoRestante -= descuento;
      montoSuplementGlobal += descuento;
      await contratoMarco.save();
    }

    // Crear factura
=======
    if (montoNumber > totalDisponible) {
      return res.status(400).json({
        msg: "El monto excede el presupuesto total (incluyendo suplementos)",
      });
    }

    // Variables para rastrear el monto usado de suplementos
    let montoRestante = montoNumber;
    let montoSuplementTotal = 0; // Nuevo: acumula lo usado de suplementos

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
        montoSuplementTotal += descuentoSuplemento; // Nuevo: acumular suplementos usados
      }
    }

    // Crear factura y actualizar contrato (incluyendo montoSuplement)
>>>>>>> parent of b5bab00 (update facturas)
    const nuevaFactura = await Factura.create({
      contratoId: _id,
      numeroDictamen,
      monto: montoNumber,
<<<<<<< HEAD
      montoSuplementLocal,
      montoSuplementGlobal,
      supplementGlobalId: supplementGlobal?._id
=======
      montoSuplement: montoSuplementTotal, // Nuevo: guardar en la colección Factura (si es necesario)
    });

    // Guardar en el array de facturas del contrato
    contrato.factura.push({
      numeroDictamen,
      monto: montoNumber,
      montoSuplement: montoSuplementTotal, // Nuevo: añadir campo al contrato
>>>>>>> parent of b5bab00 (update facturas)
    });

    // Actualizar contrato
    contrato.factura.push({ numeroDictamen, monto: montoNumber });
    contrato.valorGastado += (descuentoInicial + montoSuplementLocal);
    await contrato.save();

<<<<<<< HEAD
    // Actualizar contrato marco si es específico
    if (!contrato.isMarco) {
      await actualizarContratosMarco(contrato, montoNumber, 'crear', supplementGlobal?._id);
    }

    // Guardar traza
=======
    // Actualizar notificación (si existe)
    const notificacion = await Notification.findOne({ contratoId: _id });
    if (notificacion) {
      notificacion.valorDisponible = contrato.valorDisponible;
      notificacion.supplement = contrato.supplement;
      await notificacion.save();
    }
    // Para INSERTAR (crearFactura)
>>>>>>> parent of b5bab00 (update facturas)
    await guardarTraza({
      entity_name: "Factura",
      entity_id: nuevaFactura._id,
      new_value: JSON.stringify(nuevaFactura.toObject()), // Convertir a JSON string
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

// Eliminar Factura (Versión Completa)
const eliminarFactura = async (req, res) => {
  try {
    const { numeroDictamen } = req.query;
    const { contratoId } = req.params;

<<<<<<< HEAD
=======
const advertenciamontoModificar = async (req, res) => {
  const { _id, numeroDictamen, monto } = req.body; // Recibimos el ID de la factura y el nuevo monto

  try {
    // Buscar la factura y el contrato asociado
>>>>>>> parent of b5bab00 (update facturas)
    const factura = await Factura.findOne({ numeroDictamen });
    if (!factura) return res.status(404).json({ msg: "Factura no encontrada" });

    const contrato = await Contrato.findById(contratoId);
    if (!contrato) return res.status(404).json({ msg: "Contrato no encontrado" });

    // Reintegrar suplemento global si existe
    if (factura.supplementGlobalId) {
      const contratoMarco = await Contrato.findOne({ "especificos": contrato._id, "isMarco": true });
      if (contratoMarco) {
        const supplement = contratoMarco.supplement.id(factura.supplementGlobalId);
        if (supplement) {
          supplement.monto += factura.montoSuplementGlobal;
          await contratoMarco.save();
        }
      }
    }

<<<<<<< HEAD
    // Reintegrar montos locales
    contrato.valorDisponible += (factura.monto - factura.montoSuplementLocal - factura.montoSuplementGlobal);
    
    // Reintegrar suplementos locales
    let remaining = factura.montoSuplementLocal;
    for (let i = contrato.supplement.length - 1; i >= 0 && remaining > 0; i--) {
      const sup = contrato.supplement[i];
      const maxDevolucion = sup.montoOriginal - sup.monto;
      const devolucion = Math.min(maxDevolucion, remaining);
      sup.monto += devolucion;
      remaining -= devolucion;
=======
    const contrato = await Contrato.findById(_id);

    // Calcular el total disponible (valorDisponible + suplementos + monto actual de la factura)
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
>>>>>>> parent of b5bab00 (update facturas)
    }

    // Actualizar contrato
    contrato.factura.pull({ _id: factura._id });
    await contrato.save();
    await factura.deleteOne();

    // Actualizar contrato marco si es específico
    if (!contrato.isMarco) {
      await actualizarContratosMarco(contrato, factura.monto, 'eliminar', factura.supplementGlobalId);
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
  const { numeroDictamen, newNumeroDictamen, monto: montoReq, supplementId } = req.body;

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

    // Buscar contrato marco si es específico
    let contratoMarco = null;
    let supplementGlobal = null;
    if (!contrato.isMarco) {
      contratoMarco = await Contrato.findOne({ "especificos": contrato._id, "isMarco": true });
      if (supplementId && contratoMarco) {
        supplementGlobal = contratoMarco.supplement.id(supplementId);
      }
    }

    // Validar nuevo número de dictamen
    if (newNumeroDictamen && newNumeroDictamen !== factura.numeroDictamen) {
      const existeNew = await Factura.findOne({ numeroDictamen: newNumeroDictamen });
      if (existeNew) return res.status(400).json({ msg: "El nuevo número de dictamen ya existe" });
    }

    // Guardar valores antiguos para reintegro
    const oldMonto = factura.monto;
    const oldMontoLocal = factura.montoSuplementLocal || 0;
    const oldMontoGlobal = factura.montoSuplementGlobal || 0;

    // Procesar cambio de monto
    if (monto !== undefined && monto !== oldMonto) {
<<<<<<< HEAD
      // 1. REINTEGRAR MONTO ANTERIOR
      // Reintegrar suplemento global si existía
      if (factura.supplementGlobalId && contratoMarco) {
        const oldSupplement = contratoMarco.supplement.id(factura.supplementGlobalId);
        if (oldSupplement) {
          oldSupplement.monto += oldMontoGlobal;
          await contratoMarco.save();
=======
      console.log("Iniciando cambio de monto...");

      // 1. REINTEGRAR MONTO ANTERIOR (como en eliminar)
      console.log("Reintegrando monto anterior...");

      // Restaurar valor disponible
      const montoValorDisponible = oldMonto - oldMontoSuplement;
      contrato.valorDisponible += montoValorDisponible;
      contrato.valorGastado -= oldMonto;

      // Restaurar suplementos
      let remainingSuplement = oldMontoSuplement;
      console.log("Restaurando", remainingSuplement, "a suplementos");

      // Restaurar en orden inverso al uso original
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

      // Si queda remanente, crear nuevo suplemento
      if (remainingSuplement > 0) {
        console.log(
          "Agregando nuevo suplemento por remanente:",
          remainingSuplement
        );
        contrato.supplement.push({
          monto: remainingSuplement,
          montoOriginal: remainingSuplement, // Mantener registro del original
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

      // 3. APLICAR NUEVO MONTO (como en crear)
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

      // Paso 2: Descontar de suplementos (en orden original)
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
>>>>>>> parent of b5bab00 (update facturas)
        }
      }

      // Reintegrar suplementos locales
      let remainingLocal = oldMontoLocal;
      for (let i = contrato.supplement.length - 1; i >= 0 && remainingLocal > 0; i--) {
        const sup = contrato.supplement[i];
        const maxDevolucion = sup.montoOriginal - sup.monto;
        const devolucion = Math.min(maxDevolucion, remainingLocal);
        sup.monto += devolucion;
        remainingLocal -= devolucion;
      }

      // Reintegrar valorDisponible
      contrato.valorDisponible += (oldMonto - oldMontoLocal - oldMontoGlobal);
      contrato.valorGastado -= oldMonto;

      // 2. VALIDAR NUEVO MONTO
      const totalLocal = contrato.valorDisponible + contrato.supplement.reduce((sum, s) => sum + s.monto, 0);
      const totalGlobal = supplementGlobal ? supplementGlobal.monto : 0;
      const totalDisponible = totalLocal + totalGlobal;

      if (monto > totalDisponible) {
        return res.status(400).json({ msg: "El nuevo monto excede el presupuesto disponible" });
      }

      // 3. APLICAR NUEVO MONTO
      let montoRestante = monto;
      let montoSuplementLocal = 0;
      let montoSuplementGlobal = 0;
      let newSupplementGlobalId = null;

      // Paso 1: Usar valorDisponible local
      const descuentoInicial = Math.min(contrato.valorDisponible, montoRestante);
      contrato.valorDisponible -= descuentoInicial;
      montoRestante -= descuentoInicial;

      // Paso 2: Usar suplementos locales
      if (montoRestante > 0) {
        for (const sup of contrato.supplement) {
          if (montoRestante <= 0) break;
          const descuento = Math.min(sup.monto, montoRestante);
          sup.monto -= descuento;
          montoRestante -= descuento;
          montoSuplementLocal += descuento;
        }
      }

      // Paso 3: Usar suplemento global (si existe)
      if (montoRestante > 0 && supplementGlobal) {
        const descuento = Math.min(supplementGlobal.monto, montoRestante);
        supplementGlobal.monto -= descuento;
        montoRestante -= descuento;
        montoSuplementGlobal += descuento;
        newSupplementGlobalId = supplementGlobal._id;
        await contratoMarco.save();
      }

      // Actualizar factura
      factura.monto = monto;
      factura.montoSuplementLocal = montoSuplementLocal;
      factura.montoSuplementGlobal = montoSuplementGlobal;
      factura.supplementGlobalId = newSupplementGlobalId;

<<<<<<< HEAD
      // Actualizar contrato
      contrato.valorGastado += monto;
=======
      // Actualizar en array del contrato
      const facturaContrato = contrato.factura.find((f) =>
        f._id.equals(factura._id)
      );
      if (facturaContrato) {
        facturaContrato.monto = monto;
        facturaContrato.montoSuplement = montoSuplementTotal;
        console.log("Actualizado en array de facturas del contrato");
      }
>>>>>>> parent of b5bab00 (update facturas)
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
        'modificar',
        factura.supplementGlobalId
      );
    }
<<<<<<< HEAD

    // Guardar traza
=======
    // Para ACTUALIZAR (modificarFactura)
>>>>>>> parent of b5bab00 (update facturas)
    await guardarTraza({
      entity_name: "Factura",
      entity_id: factura._id,
      old_value: JSON.stringify({
<<<<<<< HEAD
        numeroDictamen,
=======
        // Convertir objeto a string
        numeroDictamen: numeroDictamen,
>>>>>>> parent of b5bab00 (update facturas)
        monto: oldMonto,
        montoSuplementLocal: oldMontoLocal,
        montoSuplementGlobal: oldMontoGlobal
      }),
      new_value: JSON.stringify(factura.toObject()), // Convertir documento a string
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
<<<<<<< HEAD
const visualizaFactura = async (req, res) => {
  const { numeroDictamen } = req.body;

  try {
    const factura = await Factura.findOne({ numeroDictamen })
      .populate({
        path: "contratoId",
        select: "numeroDictamen tipoDeContrato isMarco"
      });

=======
const eliminarFactura = async (req, res) => {
  try {
    const { numeroDictamen } = req.query;
    const { contratoId } = req.params;
    // Buscar factura y contrato
    const factura = await Factura.findOne({ numeroDictamen });
>>>>>>> parent of b5bab00 (update facturas)
    if (!factura) {
      return res.status(404).json({ msg: "No se encontró la factura solicitada" });
    }

    // Agregar detalles de suplemento global si existe
    let supplementGlobalInfo = null;
    if (factura.supplementGlobalId) {
      const contratoMarco = await Contrato.findOne(
        { "especificos": factura.contratoId._id, "isMarco": true },
        { "supplement": { $elemMatch: { _id: factura.supplementGlobalId } } }
      );
      if (contratoMarco && contratoMarco.supplement.length > 0) {
        supplementGlobalInfo = {
          nombre: contratoMarco.supplement[0].nombre,
          montoOriginal: contratoMarco.supplement[0].montoOriginal
        };
      }
    }

    const response = {
      ...factura.toObject(),
      supplementGlobalInfo
    };

<<<<<<< HEAD
    return res.status(200).json(response);
=======
    // Variables clave
    const montoSuplement = factura.montoSuplement;
    const montoValorDisponible = factura.monto - montoSuplement;

    // Restaurar suplementos (en orden inverso al uso original)
    let remainingSuplement = montoSuplement;
    for (
      let i = contrato.supplement.length - 1;
      i >= 0 && remainingSuplement > 0;
      i--
    ) {
      const suplemento = contrato.supplement[i];
      const maxDevolucion = suplemento.montoOriginal - suplemento.monto; // Necesitas guardar montoOriginal
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

    // Actualizar notificación
    if (notificaciones) {
      notificaciones.valorDisponible = contrato.valorDisponible;
      await notificaciones.save();
    }
    // Para ELIMINAR (eliminarFactura)
    await guardarTraza({
      entity_name: "Factura",
      entity_id: factura._id,
      old_value: JSON.stringify(factura.toObject()), // Convertir a string
      action_type: "ELIMINAR",
      changed_by: req.usuario.nombre,
      ip_address: ipAddress(req),
      session_id: req.sessionID,
      metadata: userAgent(req),
    });

    res.status(200).json({ msg: "Factura eliminada con éxito" });
>>>>>>> parent of b5bab00 (update facturas)
  } catch (error) {
    console.error("Error al buscar la factura:", error);
    return res.status(500).json({ msg: "Error al intentar buscar la factura" });
  }
};
const advertenciamontoCrear = async (req, res) => {
  const { _id, monto, supplementId } = req.body;
  
  try {
    const contrato = await Contrato.findById(_id);
    if (!contrato) return res.status(404).json({ msg: "Contrato no encontrado" });

    // Buscar suplemento global si es específico
    let supplementGlobal = null;
    if (!contrato.isMarco && supplementId) {
      const contratoMarco = await Contrato.findOne({ "especificos": contrato._id, "isMarco": true });
      if (contratoMarco) {
        supplementGlobal = contratoMarco.supplement.id(supplementId);
      }
    }

    // Calcular total disponible
    const totalLocal = contrato.valorDisponible + contrato.supplement.reduce((sum, s) => sum + s.monto, 0);
    const totalGlobal = supplementGlobal ? supplementGlobal.monto : 0;
    const totalDisponible = totalLocal + totalGlobal;

    if (monto > totalDisponible) {
      return res.status(200).json({
        msg: "No hay suficiente presupuesto para registrar esta factura",
        success: false,
        requiereSuplemento: true,
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

    // Buscar suplemento global si existe en la factura
    let supplementGlobal = null;
    if (factura.supplementGlobalId && !contrato.isMarco) {
      const contratoMarco = await Contrato.findOne({ "especificos": contrato._id, "isMarco": true });
      if (contratoMarco) {
        supplementGlobal = contratoMarco.supplement.id(factura.supplementGlobalId);
      }
    }

    // Calcular total disponible (incluyendo reintegro del monto actual)
    const totalLocal = contrato.valorDisponible + 
                      contrato.supplement.reduce((sum, s) => sum + s.monto, 0) + 
                      (factura.monto - factura.montoSuplementLocal);

    const totalGlobal = supplementGlobal ? 
                        (supplementGlobal.monto + factura.montoSuplementGlobal) : 
                        0;

    const totalDisponible = totalLocal + totalGlobal;

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
