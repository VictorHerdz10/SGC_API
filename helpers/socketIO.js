import Notificacion from "../models/Notificiones.js";
import { Server } from 'socket.io';
import {
  verificarYEnviarNotificaciones,
  limpiarNotificacionesAntiguas
} from "../services/notificacionService.js";
const socket = httpserver => {
// Configurar Socket.IO
const io = new Server(httpserver);

// Funciones para enviar notificaciones
function emitNotifications(notifications) {
  io.emit('new_notifications', notifications);
}

// Escuchar conexiones 
io.on('connection', (socket) => {
  console.log('Cliente conectado');

  socket.on('disconnect', () => {
    console.log('Cliente desconectado');
  });
});

// Tarea programada para verificar y enviar notificaciones cada minuto
setInterval(async () => {
  try {
    await verificarYEnviarNotificaciones();
    await limpiarNotificacionesAntiguas();
    
    const notifications = await Notificacion.find().sort('-fechaEnvio').limit(10);
    emitNotifications(notifications);
  } catch (error) {
    console.error('Error en la tarea programada:', error);
  }
}, 60000); // Cada minuto

// Función para procesar notificaciones recibidas
io.on('new_notification', (notification) => {
  console.log(`Nueva notificación recibida: ${notification.mensaje}`);
  // Aquí puedes agregar lógica para mostrar la notificación en una interfaz gráfica o tomar otras acciones según sea necesario
});
}
export default socket;