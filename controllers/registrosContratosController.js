import calcularFechaFin from "../helpers/calcularFecha.js";
import Contrato from "../models/Contratos.js";
import path from "path";
import Factura from "../models/Factura.js";
import getDirectLink from "../helpers/generarLink.js";
import Notification from "../models/Notification.js";
import Direccion from "../models/Direccion.js";
import { fileURLToPath } from "url";
import { Dropbox } from 'dropbox';
import Usuario from "../models/Usuario.js";
import moment from "moment";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const registrarContrato = async (req, res) => {
  const { usuario } = req;
  const currentDate = moment().format("YYYYMMDD");
      const originalnameWithoutExtension = path.parse(
        req.file.originalname
      ).name;
      const customFilename = `${originalnameWithoutExtension}-${currentDate}${path.extname(
        req.file.originalname
      )}`;
  const token = await Usuario.findOne({tipo_usuario:"Admin_Gnl"});
  
  const dbx =await new Dropbox({
    accessToken: token.accessToken
  });
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

  try {
    const contrato = await Contrato.findOne({
      $and: [
        { numeroDictamen: numeroDictamen },
        { direccionEjecuta: direccionEjecuta },
      ],
    });

 

    if (contrato && contrato._id) {
      return res.status(403).json({
        msg: `El registro del contrato ${numeroDictamen} ya existe en la ${direccionEjecuta}`,
      });
    }
    if (usuario.tipo_usuario === "especialista") {
     
      const direcciones = await Direccion.find({ ejecutivoId: relacionId });
      if (direcciones.length === 0) {
        return res
          .status(403)
          .json({ msg: `No tienes permiso a para realizar esta accion` });
      }
      const tienePermisos = direcciones.some(
        (dir) => dir.direccionEjecutiva === direccionEjecuta
      );

      if (!tienePermisos) {
        return res.status(403).json({
          msg: `No tienes permiso para crear un nuevo contrato de esta dirección`,
        });
      }
    }
    if (usuario.tipo_usuario === "director") {
      const direcciones = await Direccion.find({ ejecutivoId: usuario._id });
      if (direcciones.length === 0) {
        return res
          .status(403)
          .json({ msg: `No tienes permiso a para realizar esta accion` });
      }

      const tienePermisos = direcciones.some(
        (dir) => dir.direccionEjecutiva === direccionEjecuta
      );

      if (!tienePermisos) {
        return res.status(403).json({
          msg: `No tienes permiso para crear un nuevo contrato de esta dirección`,
        });
      }
    }
    let newContrato;
    if (req.file) {
      const originalName = req.file.originalname;
      // Subir archivo a Dropbox
      const uploadedFile = await dbx.filesUpload({
        path: "/documentos/" + customFilename,
        contents: req.file.buffer,
        mode: "add",
        autorename: true,
        mute: true,
      });

      // Obtener el link público del archivo
      const publicLink = await dbx.sharingCreateSharedLinkWithSettings({
        path: uploadedFile.result.path_display,
        settings: {
          requested_visibility: {
            ".tag": "public",
          },
        },
      });
      if (
        publicLink.error &&
        publicLink.error.summary === "shared_link_already_exists"
      ) {
        return res
          .status(400)
          .json({ msg: "El archivo ya tiene un vínculo compartido público" });
      }
      const link = getDirectLink(publicLink.result.url);

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
        subirPDF: link,
        originalName,
        dropboxPath: uploadedFile.result.path_display,
        info: {
          creadoPor: usuario.nombre,
          fechaDeCreacion: new Date().toISOString(),
          modificadoPor: usuario.nombre,
          fechaDeModificacion: new Date().toISOString(),
        },
      });
    } else {
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
        info: {
          creadoPor: usuario.nombre,
          fechaDeCreacion: new Date().toISOString(),
          modificadoPor: usuario.nombre,
          fechaDeModificacion: new Date().toISOString(),
        },
      });
    }
    // Guardar el contrato en la base de datos
    await newContrato.save();
  
    return res.status(200).json({ msg: "Contrato registrado exitosamente" });
  } catch (error) {
    console.error("Error al registrar contrato:", error);
    return res.status(500).json({ error: "Error al registrar contrato" });
  }
};

const obtenerRegistroContratos = async (req, res) => {
  const { usuario } = req;
  try {
    if (usuario.tipo_usuario === "director") {
      const direcciones = await Direccion.find({ ejecutivoId: usuario._id });

      const contratos = await Contrato.find({
        direccionEjecuta: {
          $in: direcciones.map((direccion) => direccion.direccionEjecutiva),
        },
      });
      return res.status(200).json(contratos);
    }
    if (usuario.tipo_usuario === "especialista") {
      const direcciones = await Direccion.find({
        ejecutivoId: usuario.relacionId,
      });
      const contratos = await Contrato.find({
        direccionEjecuta: {
          $in: direcciones.map((direccion) => direccion.direccionEjecutiva),
        },
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
  const token = await Usuario.findOne({tipo_usuario:"Admin_Gnl"});
  const currentDate = moment().format("YYYYMMDD");
      const originalnameWithoutExtension = path.parse(
        req.file.originalname
      ).name;
      const customFilename = `${originalnameWithoutExtension}-${currentDate}${path.extname(
        req.file.originalname
      )}`;
  const dbx =await new Dropbox({
    accessToken: token.accessToken
  });
  const { id } = req.params;
  const { usuario } = req;
  const bodyRest = { ...req.body };
  delete bodyRest.subirPDF;

  
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

    if (!req.file) {
      contrato.info.modificadoPor=usuario.nombre;
      contrato.info.fechaDeModificacion=new Date().toISOString();
      await contrato.save();
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
      return res
        .status(200)
        .json({ msg: "Contrato actualizado exitosamente", contrato });
    }
    const originalName = req.file.originalname;
 if(contrato.dropboxPath){
    await dbx.filesDeleteV2({
      path: contrato.dropboxPath,
    });

    console.log(
      "Archivo existente eliminado de la nube:",
      contrato.originalName
    );}
    // Subir archivo a Dropbox
    const uploadedFile = await dbx.filesUpload({
      path: "/documentos/" + customFilename,
      contents: req.file.buffer,
      mode: "add",
      autorename: true,
      mute: true,
    });

    // Obtener el link público del archivo
    const publicLink = await dbx.sharingCreateSharedLinkWithSettings({
      path: uploadedFile.result.path_display,
      settings: {
        requested_visibility: {
          ".tag": "public",
        },
      },
    });
    const link = getDirectLink(publicLink.result.url);
    
    contrato.info.modificadoPor=usuario.nombre;
    contrato.info.fechaDeModificacion=new Date().toISOString();
    contrato.dropboxPath = uploadedFile.result.path_display;
    contrato.originalName = originalName;
    contrato.subirPDF = link;
    await contrato.save();

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
    return res
      .status(200)
      .json({ msg: "Contrato actualizado exitosamente", contrato });
  } catch (error) {
    console.error("Ha ocurrido un error al actualizar:", error);
    return res
      .status(500)
      .json({ msg: "Error al intentar actualizar el registro" });
  }
};

const eliminarRegistroContrato = async (req, res) => {
  const { id } = req.params;
  const token = await Usuario.findOne({tipo_usuario:"Admin_Gnl"});

  const dbx = await new Dropbox({
    accessToken: token.accessToken
  });
  try {
    const contrato = await Contrato.findById(id);
    if (!contrato) {
      return res.status(404).json({ msg: "Contrato no encontrado" });
    }
    const facturas = await Factura.find({ contratoId: id });
    if (facturas.length > 0) {
      await Factura.deleteMany({ contratoId: id });
    }
    if (contrato.dropboxPath) {
      await dbx.filesDeleteV2({
        path: contrato.dropboxPath,
      });
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

const obtenerContratosFiltrados = async (req, res) => {
  const { estado, direccionEjecuta, entidad } = req.body;
  const { usuario } = req;

  try {
    let query = {};

    if (estado) {
      query.estado = estado;
    }

    if (direccionEjecuta) {
      query.direccionEjecuta = direccionEjecuta;
    }

    if (entidad) {
      query.entidad = entidad;
    }
    if (usuario.tipo_usuario === "director") {
      const direcciones = await Direccion.find({ ejecutivoId: usuario._id });
      const contratos = await Contrato.find({
        direccionEjecuta: {
          $in: direcciones.map((direccion) => direccion.direccionEjecutiva),
        },
        ...query, // Asegúrate de que 'query' esté definido antes de esta línea
      });

      // Filtra los contratos según la query si es necesario
      const filteredContratos = contratos.filter((item) =>
        Object.keys(query).every((key) => item[key] === query[key])
      );

      return res.status(200).json(filteredContratos);
    }
    if (usuario.tipo_usuario === "especialista") {
      const direcciones = await Direccion.find({
        ejecutivoId: usuario.relacionId,
      });
      const contratos = await Contrato.find({
        direccionEjecuta: {
          $in: direcciones.map((direccion) => direccion.direccionEjecutiva),
        },
        ...query, // Asegúrate de que 'query' esté definido antes de esta línea
      });

      // Filtra los contratos según la query si es necesario
      const filteredContratos = contratos.filter((item) =>
        Object.keys(query).every((key) => item[key] === query[key])
      );

      return res.status(200).json(filteredContratos);
    }

    const contratos = await Contrato.find(query);
    return res.status(200).json(contratos);
  } catch (error) {
    console.error("Ha ocurrido un error al obtener los contratos:", error);
    return res
      .status(500)
      .json({ msg: "Error al intentar obtener los contratos" });
  }
};

const notificarcontratos = async (req, res) => {
  const { usuario } = req;
  try {
    let contratos;
    let notificaciones;
    const hoy = new Date();
    const fechaLimite = new Date(hoy);
    fechaLimite.setDate(hoy.getDate() + 30); // Fecha límite para los contratos que están por vencer

    // Función para crear una notificación si no existe
    const createNotificationIfNotExists = async (contratoId) => {
      const existingNotification = await Notification.findOne({
        contratoId: contratoId,
      });

      if (!existingNotification) {
        const contrato = await Contrato.findById(contratoId);
        if (!contrato) {
          console.log(`Contrato con ID ${contratoId} no encontrado`);
          return;
        }

        const notification = new Notification({
          description: `El contrato ${contrato.numeroDictamen} está por vencer.`,
          direccionEjecutiva: contrato.direccionEjecuta,
          contratoId: contrato._id,
          fechaVencimiento: contrato.fechaVencimiento,
          entidad: contrato.entidad,
        });
        await notification.save();
        console.log(
          `Notificación creada para el contrato ${contrato.numeroDictamen}`
        );
      } else {
      }
    };

    // Acceso completo a todos los contratos que están por vencer
    contratos = await Contrato.find({
      fechaVencimiento: { $gte: hoy, $lte: fechaLimite }, // Contratos que van a vencer en 30 días
    });

    if (!contratos || contratos.length === 0) {
      res
        .status(200)
        .json({ msg: "No hay contratos por vencer en los próximos 30 días." });
      console.log("No hay contratos por vencer");
    } else {
      // Crear notificaciones para cada contrato si no existe una
      await Promise.all(
        [...new Set(contratos.map((c) => c._id))].map(async (id) => {
          await createNotificationIfNotExists(id);
        })
      );

      if (usuario.tipo_usuario === "director") {
        const direcciones = await Direccion.find({ ejecutivoId: usuario._id });

        const notificacionesServicios = await Notification.find({
          direccionEjecutiva: {
            $in: direcciones.map((direccion) => direccion.direccionEjecutiva),
          },
          readByDirector: false,
        });

        return res.status(200).json(notificacionesServicios);
      }
      if (usuario.tipo_usuario === "especialista") {
        const direcciones = await Direccion.find({
          ejecutivoId: usuario.relacionId,
        });

        const notificacionesServicios = await Notification.find({
          direccionEjecutiva: {
            $in: direcciones.map((direccion) => direccion.direccionEjecutiva),
          },
          readByEspecialista: false,
        });

        return res.status(200).json(notificacionesServicios);
      }
      const allNotification = await Notification.find({
        readByAdmin: false,
      });
      return res.status(200).json(allNotification);
    }
  } catch (error) {
    console.error("Ha ocurrido un error al obtener los contratos:", error);
    return res
      .status(500)
      .json({ msg: "Error al intentar obtener los contratos" });
  }
};
const marcarComoLeidas = async (req, res) => {
  const { usuario } = req;
  const { id } = req.params;

  try {
    const notificacion = await Notification.findById(id);

    if (notificacion) {
      if (usuario.tipo_usuario === "director") {
        notificacion.readByDirector = true;
      }
      if (usuario.tipo_usuario === "especialista") {
        notificacion.readByEspecialista = true;
      }
      notificacion.readByAdmin = true;
      // Actualizar la notificación en la base de datos
      const updatedNotification = await notificacion.save();
      return res.status(200).json({
        msg: "Notificación eliminada correctamente",
        updatedNotification,
      });
    } else {
      return res.status(404).json({ msg: "Notificación no encontrada" });
    }
  } catch (error) {
    console.error("Ha ocurrido un error:", error);
    return res
      .status(500)
      .json({ msg: "Error al intentar marcar la notificación como leída" });
  }
};

const marcarleidasAll = async (req, res) => {
  const { usuario } = req;
  try {
    if (usuario.tipo_usuario === "director") {
      const direcciones = await Direccion.find({ ejecutivoId: usuario._id });
      const notificaciones = await Notification.find({
        readBySer: false,
        direccionEjecutiva: {
          $in: direcciones.map((direccion) => direccion.direccionEjecutiva),
        },
      });
      await Promise.all(
        notificaciones.map(async (notificacion) => {
          notificacion.readByDirector = true;
          return notificacion;
        })
      );
      await Notification.bulkWrite(
        notificaciones.map((n) => ({
          updateOne: {
            filter: { _id: n._id },
            update: { $set: { readByDirector: true } },
          },
        }))
      );
      return res.status(200).json({
        msg: "Se han limpiado todas las notificaciones correctamente",
      });
    }
    if (usuario.tipo_usuario === "especialista") {
      const direcciones = await Direccion.find({
        ejecutivoId: usuario.relacionId,
      });
      const notificaciones = await Notification.find({
        readByEspecialista: false,
        direccionEjecutiva: {
          $in: direcciones.map((direccion) => direccion.direccionEjecutiva),
        },
      });
      await Notification.bulkWrite(
        notificaciones.map((n) => ({
          updateOne: {
            filter: { _id: n._id },
            update: { $set: { readByEspecialista: true } },
          },
        }))
      );
      return res.status(200).json({
        msg: "Se han limpiado todas las notificaciones correctamente",
      });
    }

    const notificaciones = await Notification.find({ readByAdmin: false });
    await Promise.all(
      notificaciones.map(async (notificacion) => {
        notificacion.readByAdmin = true;
        return notificacion;
      })
    );
    await Notification.bulkWrite(
      notificaciones.map((n) => ({
        updateOne: {
          filter: { _id: n._id },
          update: { $set: { readByAdmin: true } },
        },
      }))
    );
    return res.status(200).json({
      msg: "Se han limpiado todas las notificaciones correctamente",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      msg: "Error al intentar marcar la notificación como leída",
      error,
    });
  }
};

const eliminarNotificacionesArchivadas = async () => {
  try {
    console.log("Iniciando proceso de eliminación de notificaciones archivadas");

    const notificacionesleidas = await Notification.find({
      readByAdmin: true,
      readBySer: true,
      readByMant: true,
    });
    console.log('Número de notificaciones encontradas:', notificacionesleidas.length);

    if (!notificacionesleidas || notificacionesleidas.length === 0) {
      console.log('No hay notificaciones que eliminar');
      return;
    }

    console.log('Notificaciones a eliminar:', notificacionesleidas);

    const resultadoEliminacion = await Notification.deleteMany({
      readByAdmin: true,
      readBySer: true,
      readByMant: true,
    });
    console.log('Resultado de la eliminación:', resultadoEliminacion);

    console.log("Notificaciones eliminadas");
    console.log(`Número de notificaciones eliminadas: ${resultadoEliminacion.deletedCount}`);

  } catch (error) {
    console.error("Ha ocurrido un error al eliminar las notificaciones leidas:", error);
  }
};

const cambiarEstado = async () => {
  try {
    // Obtener la fecha actual
    const currentDate = new Date();
    console.log('Fecha actual:', currentDate);

    // Buscar todos los contratos activos que vencieron
    const contratosVencidos = await Contrato.find({
      estado: "Ejecución",
      fechaVencimiento: { $lte: currentDate },
    });
    console.log('Contratos vencidos encontrados:', contratosVencidos.length);

    if (!contratosVencidos || contratosVencidos.length === 0) {
      console.log('No hay contratos vencidos');
      return;
    }

    console.log('Contratos vencidos:', contratosVencidos);

    // Actualizar el estado de los contratos vencidos
    const result = await Contrato.updateMany(
      { estado: "Ejecución", fechaVencimiento: { $lte: currentDate } },
      { $set: { estado: "Finalizado" } }
    );
    console.log('Resultado de la actualización:', result);

    // Respuesta exitosa
    console.log(`Estados de contratos actualizados. Contratos modificados: ${result.modifiedCount}`);
    
    // Verificar el resultado después de la actualización
    const contratosActualizados = await Contrato.find({
      estado: "Finalizado",
      fechaVencimiento: { $lte: currentDate },
    });
    console.log('Contratos actualizados:', contratosActualizados.length);
    console.log('Primer contrato actualizado:', contratosActualizados[0]);

  } catch (error) {
    console.error("Error al actualizar estados de contratos:", error);
  }
};
export {
  registrarContrato,
  obtenerRegistroContratos,
  actualizarRegistroContrato,
  eliminarRegistroContrato,
  obtenerContratosFiltrados,
  notificarcontratos,
  marcarComoLeidas,
  eliminarNotificacionesArchivadas,
  marcarleidasAll,
  cambiarEstado,
};
