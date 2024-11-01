import express from "express";
import checkAuth from "../middleware/authMiddleware.js";
import {
    crearEntidad,
    eliminarEntidad,
    obtenerEntidades,
    modificarEntidad
} from "../controllers/entidadControler.js";

const router = express.Router();

//Ruta privada de Entidades
router.post("/",checkAuth,crearEntidad);
router.get("/obtener-entidades",checkAuth,obtenerEntidades);
router.put("/modificar-entidad/:id",checkAuth,modificarEntidad);
router.delete("/eliminar-entidad/:id",checkAuth,eliminarEntidad);




export default router;