import cron from 'node-cron';
import { cambiarEstado,eliminarNotificacionesArchivadas } from '../controllers/registrosContratosController.js';
const dailyTask = {
    name: 'Actualizar Estados y Eliminar Notificaciones Archivadas',
    schedule: '0 0 * * *', // Ejecuta cada día a la medianoche
    task: async () => {
      console.log('Ejecutando tarea diaria: Actualizar Estados y Eliminar Notificaciones Archivadas');
  
      try {
        await cambiarEstado();
        await eliminarNotificacionesArchivadas();
  
        console.log('Tarea diaria completada con éxito');
      } catch (error) {
        console.error('Error en la tarea diaria:', error);
      }
    }
  };
  export default dailyTask;