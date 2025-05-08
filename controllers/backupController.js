import Backup from "../models/Backup.js";
import Usuario from "../models/Usuario.js";
import { Dropbox } from "dropbox";
import backupDatabase from "../helpers/backupData.js";
import restoreDatabaseFromBackup from "../helpers/restoreData.js";
import mongoose from "mongoose";
import guardarTraza from "../helpers/saveTraza.js";
import { ipAddress, userAgent } from "../helpers/ipAndMetadata.js";
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip'; 


const respaldarDatos = async (req, res) => {
  const { usuario } = req;
  if (usuario.tipo_usuario !== "Admin_Gnl") {
    return res
      .status(403)
      .json({ msg: "No tienes permisos para realizar esta acción" });
  }
  const token = await Usuario.findOne({ tipo_usuario: "Admin_Gnl" });
  const dbx = await new Dropbox({
    accessToken: token.accessToken,
  });
  try {
    const archivos = await dbx.filesListFolder({ path: "/Backups" });
  } catch (error) {
    return res.status(403).json({
      msg: "El token del gestor de archivos ha vencido, actualicelo si quiere proceder con la acción",
    });
  }
  try {
    const backupPath = await backupDatabase(dbx);
    await guardarTraza({
      entity_name: "Backups",
      action_type: "BACKUP",
      changed_by: usuario.nombre,
      ip_address: ipAddress(req),
      session_id: req.sessionID,
      metadata: userAgent(req),
    });
    return res.json({
      msg: "Copia de seguridad completada satifactoriamente! Archivos encriptados y seguros.",
    });
  } catch (error) {
    console.error("Error al crear respaldo:", error);
    res.status(500).json({ error: "Error al crear copia de seguridad" });
  }
};

const obtenerDatos = async (req, res) => {
  try {
    const datos = await Backup.find();
    return res.status(200).json(datos);
  } catch (error) {
    return res.status(500).json({ msg: "Error al obtener datos" });
  }
};

const restablecerDataBase = async (req, res) => {
  const { usuario } = req;
  if (usuario.tipo_usuario !== "Admin_Gnl") {
    return res
      .status(403)
      .json({ msg: "No tienes permisos para realizar esta acción" });
  }
  const token = await Usuario.findOne({ tipo_usuario: "Admin_Gnl" });
  const dbx = await new Dropbox({
    accessToken: token.accessToken,
  });
  try {
    const archivos = await dbx.filesListFolder({ path: "/Backups" });
  } catch (error) {
    return res.status(403).json({
      msg: "El token del gestor de archivos ha vencido, actualicelo si quiere proceder con la acción",
    });
  }
  try {
    // Restaurar la base de datos
    await restoreDatabaseFromBackup(dbx, req.body.dropboxPath);
    await guardarTraza({
      entity_name: "Backups",
      action_type: "BACKUP",
      changed_by: usuario.nombre,
      ip_address: ipAddress(req),
      session_id: req.sessionID,
      metadata: userAgent(req),
    });
    return res
      .status(200)
      .json({ msg: "Base de datos restaurada exitosamente" });
  } catch (error) {
    return res.status(500).json({ msg: "Error al restaurar la base de datos" });
  }
};

const eliminarBackup = async (req, res) => {
  const { usuario } = req;
  if (usuario.tipo_usuario !== "Admin_Gnl") {
    return res
      .status(403)
      .json({ msg: "No tienes permisos para realizar esta acción" });
  }
  const token = await Usuario.findOne({ tipo_usuario: "Admin_Gnl" });
  const dbx = await new Dropbox({
    accessToken: token.accessToken,
  });
  try {
    const archivos = await dbx.filesListFolder({ path: "/Backups" });
  } catch (error) {
    return res.status(403).json({
      msg: "El token del gestor de archivos ha vencido, actualicelo si quiere proceder con la acción",
    });
  }
  try {
    const id = req.params.id;
    const backup = await Backup.findById(id);
    if (backup.dropboxPath) {
      // Eliminar todos los contenidos de la carpeta
      const entries = await dbx.filesListFolder({ path: backup.dropboxPath });
      for (let entry of entries.result.entries) {
        const fullPath = entry.path_display;
        await dbx.filesDeleteV2({ path: fullPath });
      }
    }
    await guardarTraza({
      entity_name: "Backups",
      entity_id:backup._id,
      action_type: "ELIMINAR",
      changed_by: usuario.nombre,
      ip_address: ipAddress(req),
      session_id: req.sessionID,
      metadata: userAgent(req),
    });
    await backup.deleteOne();
    return res
      .status(200)
      .json({ msg: "Copia de seguridad eliminada satifactoriamente!" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: "Error al eliminar el copia de seguridad" });
  }
};
const crearBackupLocal = async (req, res) => {
  const { usuario } = req;
  if (usuario.tipo_usuario !== "Admin_Gnl") {
    return res
      .status(403)
      .json({ msg: "No tienes permisos para realizar esta acción" });
  }

  try {
    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const backupData = {};

    for (const collection of collections) {
      const data = await mongoose.connection.db
        .collection(collection.name)
        .find({})
        .toArray();
      backupData[collection.name] = data;
    }
    await guardarTraza({
      entity_name: "Backups",
      action_type: "BACKUP",
      changed_by: usuario.nombre,
      ip_address: ipAddress(req),
      session_id: req.sessionID,
      metadata: userAgent(req),
    });
    return res.status(200).json(backupData);
  } catch (error) {
    console.error("Error al crear backup local:", error);
    return res.status(500).json({ msg: "Error al crear backup local" });
  }
};

const restaurarBackupLocal = async (req, res) => {
  const { usuario } = req;
  if (usuario.tipo_usuario !== "Admin_Gnl") {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(403).json({ msg: "No tienes permisos para realizar esta acción" });
  }

  try {
    if (!req.file) {
      return res.status(400).json({ msg: "No se ha subido ningún archivo" });
    }

    const filePath = path.resolve(req.file.path);
    
    if (!fs.existsSync(filePath)) {
      return res.status(400).json({ msg: "El archivo subido no existe" });
    }

    // Función recursiva para convertir ObjectIds en todo el documento
    const convertObjectIds = (obj, collectionName) => {
      if (Array.isArray(obj)) {
        // Caso especial para el array 'especificos' en la colección Contrato
        if (collectionName === 'contratos' && obj.length > 0 && typeof obj[0] === 'string') {
          return obj.map(id => {
            if (mongoose.Types.ObjectId.isValid(id) && id.length === 24 && /^[0-9a-fA-F]+$/.test(id)) {
              return new mongoose.Types.ObjectId(id);
            }
            return id;
          });
        }
        return obj.map(item => convertObjectIds(item, collectionName));
      } else if (obj !== null && typeof obj === 'object') {
        return Object.fromEntries(
          Object.entries(obj).map(([key, value]) => {
            // Convertir strings que coincidan con formato ObjectId
            if (typeof value === 'string' && mongoose.Types.ObjectId.isValid(value)) {
              if (value.length === 24 && /^[0-9a-fA-F]+$/.test(value)) {
                try {
                  return [key, new mongoose.Types.ObjectId(value)];
                } catch (error) {
                  console.warn(`ID inválido en campo ${key}: ${value}`);
                  return [key, value];
                }
              }
            } else if (typeof value === 'object' && value !== null) {
              return [key, convertObjectIds(value, collectionName)];
            }
            return [key, value];
          })
        );
      }
      return obj;
    };

    // Leer el archivo ZIP
    const fileContent = fs.readFileSync(filePath);
    const zip = new JSZip();
    const zipContents = await zip.loadAsync(fileContent);

    // Procesar cada archivo en el ZIP
    const fileNames = Object.keys(zipContents.files);
    
    for (const fileName of fileNames) {
      if (!fileName.endsWith('.json')) continue;
      
      const collectionName = fileName.replace('.json', '');
      
      const fileData = await zipContents.files[fileName].async('text');
      let documents = JSON.parse(fileData);

      
      documents = documents.map(doc => convertObjectIds(doc, collectionName));

      const collection = mongoose.connection.db.collection(collectionName);
      
      
      await collection.deleteMany({});
      
      if (documents.length > 0) {
        
        const batchSize = 100;
        for (let i = 0; i < documents.length; i += batchSize) {
          const batch = documents.slice(i, i + batchSize);
          try {
            await collection.insertMany(batch, { ordered: false });
          } catch (insertError) {
            
          }
        }
      }
    }

    fs.unlinkSync(filePath);

    // Registrar traza
    await guardarTraza({
      entity_name: "Backups",
      action_type: "RESTORE",
      changed_by: usuario.nombre,
      ip_address: ipAddress(req),
      session_id: req.sessionID,
      metadata: userAgent(req),
    });

    return res.status(200).json({ msg: "Restauración completada exitosamente" });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    console.error("Error en restauración:", error);
    return res.status(500).json({ 
      msg: "Error en restauración",
      error: error.message 
    });
  }
};
export {
  respaldarDatos,
  obtenerDatos,
  restablecerDataBase,
  eliminarBackup,
  crearBackupLocal,
  restaurarBackupLocal,
};
