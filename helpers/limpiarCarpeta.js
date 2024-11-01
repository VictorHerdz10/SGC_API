

import fs from 'fs/promises';
import path from 'path';

const  limpiarCarpetaLocal=async(rutaCarpeta)=> {
  try {
     // Verificar si la carpeta existe
     await fs.access(rutaCarpeta);
    
     console.log(`Intentando eliminar archivos de: ${rutaCarpeta}`);
    // Eliminar todos los archivos en la carpeta
    const files = await fs.readdir(rutaCarpeta);
    for (let i = 0; i < files.length; i++) {
      const filePath = path.join(rutaCarpeta, files[i]);
      await fs.unlink(filePath);
      console.log(`Archivo eliminado: ${filePath}`);
    }

  } catch (error) {
    console.error('Error al limpiar la carpeta local:', error);
  }
}

export default limpiarCarpetaLocal;