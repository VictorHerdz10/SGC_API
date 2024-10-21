import fs from 'fs/promises';
import path from 'path';
import Contrato from '../models/Contratos.js';

export async function eliminarArchivoAnterior(rutaCompleta) {
  try {
    await fs.access(rutaCompleta);
    await fs.unlink(rutaCompleta);
    console.log('Archivo anterior eliminado con éxito');
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('No se encontró archivo anterior para eliminar');
    } else {
      throw error;
    }
  }
}

export async function subirArchivo(req, res, next) {
    const{id}=req.params;
    try {
        const contrato  = await Contrato.findById(id);

 if(!contrato.subirPDF){
     return next();
 }
  
  // Obtenemos la ruta del archivo existente
  const rutaArchivoExistente = path.join(process.cwd(), 'public', contrato.subirPDF);  

    await eliminarArchivoAnterior(rutaArchivoExistente);
     return next(); // Continúa con la siguiente función middleware
  } catch (error) {
    console.error('Error al eliminar archivo anterior:', error);
    return res.status(500).json({ mensaje: 'Error al procesar el archivo' });
  }
}