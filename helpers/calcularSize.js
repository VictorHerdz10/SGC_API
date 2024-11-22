import mongoose from 'mongoose';
import { Dropbox } from "dropbox";
import Usuario from '../models/Usuario.js';
const calcularTamanoArchivos = async (pathDropbox) => {
    try {
        const token = await Usuario.findOne({ tipo_usuario: "Admin_Gnl" });

    const dbx = await new Dropbox({
      accessToken: token.accessToken,
    });
          const models = Object.values(mongoose.models);
      let totalSize = 0;
      let hasMore = true;
      let cursor;
  
      while (hasMore) {
        // Listar archivos en la carpeta
        const response = await dbx.filesListFolder({ path: pathDropbox, cursor });
        const files = response.result.entries;
  
        // Sumar el tamaño de cada archivo
        files.forEach(file => {
          if (file['.tag'] === 'file') { // Asegurarse de que es un archivo
            totalSize += file.size; // Sumar el tamaño del archivo
          }
        });
  
        // Verificar si hay más archivos
        hasMore = response.result.has_more;
        cursor = response.result.cursor;
      }
  
      return totalSize;
    } catch (error) {
      console.error('Error al calcular el tamaño de los archivos:', error);
    }
  };
  
  export default calcularTamanoArchivos;