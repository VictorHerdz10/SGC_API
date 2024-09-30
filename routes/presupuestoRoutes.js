import express from "express";
import {
    obtenerinfo,
  modificarPresupuesto,
  agregarPresupuesto
} from "../controllers/presupuestoController.js";
import checkAuth from "../middleware/authMiddleware.js";

const router = express.Router();
//Ruta Privada
router.post('/agregar-presupuesto-inicial',checkAuth,agregarPresupuesto)
router.get("/obtener-presupuesto/:id",checkAuth,obtenerinfo);
router.post("/modificar-presupuesto/:id",checkAuth,modificarPresupuesto);



export default router;