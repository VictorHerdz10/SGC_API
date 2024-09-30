import express from 'express';
import checkAuth from '../middleware/authMiddleware.js';
import {
  obtenerTodasLasNotificaciones,
  marcarComoLeida
} from '../controllers/notificationController.js';

const router = express.Router();

router.get('/listar-notificaciones', checkAuth, obtenerTodasLasNotificaciones);
router.put('/marcar-como-leida/:id', checkAuth, marcarComoLeida);

export default router;
