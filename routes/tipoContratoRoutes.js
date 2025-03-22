import express from "express";
import checkAuth from "../middleware/authMiddleware.js";
import {
  crearTipoContrato,
  obtenerTiposContrato,
  modificarTipoContrato,
  eliminarTipoContrato,
  actualizarCamposRequeridos,
  contratosAsociados,
  obtenerContratosMarco,
} from "../controllers/tipoContratoController.js";

const router = express.Router();

// Ruta para crear un nuevo tipo de contrato
router.post("/", checkAuth, crearTipoContrato);

// Ruta para obtener todos los tipos de contrato
router.get("/obtener-tipoContrato", checkAuth, obtenerTiposContrato);

router.get("/obtener-contratosMarcos", checkAuth, obtenerContratosMarco);

//Ruta para obtener la cantidad de contratos de un tipo especifico de contrato
router.get('/contratos-asociados/:id',checkAuth,contratosAsociados)

// Ruta para modificar un tipo de contrato existente
router.put("/modificar-tipoContrato/:id", checkAuth, modificarTipoContrato);

// Ruta para actualizar los campos requeridos de un tipo de contrato
router.put("/actualizar-campos/:id", checkAuth, actualizarCamposRequeridos);

// Ruta para eliminar un tipo de contrato
router.delete("/eliminar-tipoContrato/:id", checkAuth, eliminarTipoContrato);


export default router;