import Contrato from "../models/Contratos.js";
import Factura from "../models/Factura.js";
import Notification from "../models/Notification.js";

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
    const nuevaFactura = await Factura.create({
      contratoId: _id,
      numeroDictamen,
      monto: montoNumber,
      montoSuplement: montoSuplementTotal, // Nuevo: guardar en la colección Factura (si es necesario)
    });

    // Guardar en el array de facturas del contrato
    contrato.factura.push({
      numeroDictamen,
      monto: montoNumber,
      montoSuplement: montoSuplementTotal, // Nuevo: añadir campo al contrato
    });

    await contrato.save();

    // Actualizar notificación (si existe)
    const notificacion = await Notification.findOne({ contratoId: _id });
    if (notificacion) {
      notificacion.valorDisponible = contrato.valorDisponible;
      await notificacion.save();
    }

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
  const { _id, numeroDictamen, monto } = req.body; // Recibimos el ID de la factura y el nuevo monto

  try {
    // Buscar la factura y el contrato asociado
    const factura = await Factura.findOne({ numeroDictamen });
    if (!factura) {
      return res.status(404).json({ msg: "Factura no encontrada" });
    }

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
  const { numeroDictamen, newNumeroDictamen, monto } = req.body;

  try {
    // Buscar factura y contrato asociado
    const factura = await Factura.findOne(numeroDictamen);
    if (!factura) return res.status(404).json({ msg: "Factura no encontrada" });

    const contrato = await Contrato.findById(factura.contratoId);
    const notificaciones = await Notification.findOne({
      contratoId: contrato._id,
    });

    // Validar nuevo número de dictamen
    if (newNumeroDictamen && newNumeroDictamen !== factura.numeroDictamen) {
      const existeNew = await Factura.findOne({
        numeroDictamen: newNumeroDictamen,
      });
      if (existeNew) {
        return res
          .status(400)
          .json({ msg: "El nuevo número de dictamen ya existe" });
      }
    }

    // Variables clave
    const oldMonto = factura.monto;
    const oldMontoSuplement = factura.montoSuplement;
    const diferencia = monto !== undefined ? monto - oldMonto : 0;

    // Si hay cambio de monto, recalcular suplementos
    if (monto !== undefined && monto !== oldMonto) {
      // Validar si el nuevo monto es cubrible
      const totalDisponible =
        contrato.valorDisponible +
        contrato.supplement.reduce((sum, s) => sum + s.monto, 0) +
        oldMonto;

      if (monto > totalDisponible) {
        return res.status(400).json({
          msg: "El nuevo monto excede el presupuesto total disponible",
        });
      }

      // Revertir el monto anterior
      contrato.valorDisponible += oldMonto - oldMontoSuplement; // Devolver a valorDisponible
      contrato.valorGastado -= oldMonto;

      // Aplicar nuevo monto
      let montoRestante = monto;
      let montoSuplementTotal = 0;

      // Paso 1: Descontar del valorDisponible
      const descuentoInicial = Math.min(
        contrato.valorDisponible,
        montoRestante
      );
      contrato.valorDisponible -= descuentoInicial;
      montoRestante -= descuentoInicial;

      // Paso 2: Descontar de suplementos (en orden)
      if (montoRestante > 0) {
        for (const suplemento of contrato.supplement) {
          if (montoRestante <= 0) break;

          const descuentoSuplemento = Math.min(suplemento.monto, montoRestante);
          suplemento.monto -= descuentoSuplemento;
          montoRestante -= descuentoSuplemento;
          montoSuplementTotal += descuentoSuplemento;
        }
      }

      // Actualizar valores del contrato y factura
      contrato.valorGastado += monto;
      factura.monto = monto;
      factura.montoSuplement = montoSuplementTotal;
    }

    // Actualizar número de dictamen si es necesario
    if (newNumeroDictamen) {
      factura.numeroDictamen = newNumeroDictamen;
      const facturaEnContrato = contrato.factura.find((f) =>
        f._id.equals(factura._id)
      );
      if (facturaEnContrato)
        facturaEnContrato.numeroDictamen = newNumeroDictamen;
    }

    // Guardar cambios
    await contrato.save();
    await factura.save();

    // Actualizar notificación
    if (notificaciones) {
      notificaciones.valorDisponible = contrato.valorDisponible;
      await notificaciones.save();
    }

    return res.status(200).json({ msg: "Factura modificada exitosamente" });
  } catch (error) {
    console.error("Error al modificar factura:", error);
    return res.status(500).json({ msg: "Error interno del servidor" });
  }
};

const eliminarFactura = async (req, res) => {
  try {
    const { numeroDictamen } = req.query;
    const { contratoId } = req.params;

    // Buscar factura y contrato
    const factura = await Factura.findOne({ numeroDictamen, contratoId });
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
    contrato.factura.pull({ numeroDictamen: factura.numeroDictamen});

    // Eliminar factura y guardar cambios
    await factura.deleteOne();
    await contrato.save();

    // Actualizar notificación
    if (notificaciones) {
      notificaciones.valorDisponible = contrato.valorDisponible;
      await notificaciones.save();
    }

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
