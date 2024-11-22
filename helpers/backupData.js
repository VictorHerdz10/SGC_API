import mongoose from 'mongoose';
import moment from "moment";
import generarId from './generarId.js';
import Backup from '../models/Backup.js';
import calcularTamanoArchivos from './calcularSize.js';

const backupDatabase = async (dbx) => {
    try {

        const currentDate = moment().format("YYYYMMDD");
      // Obtener todos los modelos de Mongoose
      const models = Object.values(mongoose.models);
       let pathfinal;
       const idgenerated = generarId();
      // Iterar sobre cada modelo y exportar sus datos
      for (let model of models) {
        const modelName = model.modelName;
        const data = await model.find().lean();
  
        // Crear un buffer con los datos en formato JSON
        const buffer = Buffer.from(JSON.stringify(data, null, 2));
        // Subir el buffer a Dropbox
        const uploadedFile = await dbx.filesUpload({
          path: `/Backups/DB${currentDate}${idgenerated}/${modelName}.json`,
          contents: buffer,
          mode: "add",
          autorename: true,
          mute: true
        });
        pathfinal=`/Backups/DB${currentDate}${idgenerated}/`;
      }
      //Calcular el tamaño de la DB
      const size  = await calcularTamanoArchivos(pathfinal);
      const backup = await Backup.create({
        size,
        dropboxPath: pathfinal,
        });
      return pathfinal;
    } catch (error) {
      globalThis.console.error('Error al crear respaldo:', error);
      throw error;
    }
  };
        
  export default backupDatabase;