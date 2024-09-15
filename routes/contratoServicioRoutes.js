import express from "express";
import checkAuth from "../middleware/authMiddleware.js";
import {
    crearContrato,
    obtenerContratos,
    actualizarContrato,
    eliminarContrato,
    obtenerContratoPorId
  } from "../controllers/contratoController.js";
  
  const router = express.Router();
  //Ruta privada de contratos de servicios
  router.post('/',checkAuth,crearContrato);
  router.get('/listar-contratos',checkAuth,obtenerContratos)
  router.get('/listar-contratoporid/:id',checkAuth,obtenerContratoPorId);
  router.put('/actualizar-contrato/:id',checkAuth,actualizarContrato);
  router.get('/eliminar-contrato/:id',checkAuth,eliminarContrato);
  
  export default router;