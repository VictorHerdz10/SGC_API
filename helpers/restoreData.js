import mongoose from "mongoose";

const restoreDatabaseFromBackup = async (dbx, dropboxPath) => {
  const models = Object.values(mongoose.models);

  // Eliminando todas las colecciones existentes
  for (let model of models) {
    if (model.modelName !== 'Backup') {
      await model.deleteMany({});
    } 
  }

  // Carga de Datos de Dropbox
  for (let model of models) {
    const modelName = model.modelName;

    try {
      // Descarga de archivos de  Dropbox
      const response = await dbx.filesDownload({
        path: `${dropboxPath}${modelName}.json`,
      });
      const data = response.result.fileBinary; //Este es un Buffer
      // Parcear la datos de Buffer a JSON
      const parsedData = JSON.parse(data.toString("utf8"));

      
    // Insertar los datos en la base de datos, excepto para Backup
    if (modelName !== 'Backup') {
      await model.insertMany(parsedData);
    }
    } catch (error) {
      console.warn(
        `Could not find JSON file for ${modelName} or error downloading: ${error.message}`
      );
    }
  }
};
export default restoreDatabaseFromBackup;
