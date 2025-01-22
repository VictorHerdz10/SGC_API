import Backup from "../models/Backup.js";
import Usuario from "../models/Usuario.js";
import { Dropbox } from "dropbox";
import backupDatabase from "../helpers/backupData.js";
import restoreDatabaseFromBackup from "../helpers/restoreData.js";
import mongoose from "mongoose";

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

    return res.status(200).json(backupData);
  } catch (error) {
    console.error("Error al crear backup local:", error);
    return res.status(500).json({ msg: "Error al crear backup local" });
  }
};
const restaurarBackupLocal = async (req, res) => {
  console.log("Restaurando base de datos local...");
  const { usuario } = req;
  if (usuario.tipo_usuario !== "Admin_Gnl") {
    return res
      .status(403)
      .json({ msg: "No tienes permisos para realizar esta acción" });
  }

  const backupData = req.body;
  console.log(backupData);

  if (!backupData) {
    return res
      .status(400)
      .json({ msg: "No se proporcionaron datos de respaldo" });
  }

  try {
    for (const collectionName in backupData) {
      const collection = mongoose.connection.db.collection(collectionName);
      await collection.deleteMany({}); // Clear existing data

      const documents = backupData[collectionName].map((doc) => {
        if (doc._id) {
          doc._id = new mongoose.Types.ObjectId(doc._id);
        }
        return doc;
      });
      if (documents.length > 0) {
        await collection.insertMany(documents); // Insert backup data
      }
    }

    return res
      .status(200)
      .json({ msg: "Base de datos restaurada exitosamente" });
  } catch (error) {
    console.error("Error al restaurar la base de datos:", error);
    return res.status(500).json({ msg: "Error al restaurar la base de datos" });
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
