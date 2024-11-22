import express from "express";
import checkAuth from "../middleware/authMiddleware.js";
import {
    respaldarDatos,
    obtenerDatos,
    restablecerDataBase,
    eliminarBackup
} from "../controllers/backupController.js";

const router = express.Router();

//Ruta privada de Entidades
router.get("/",checkAuth,respaldarDatos);
router.get("/obtener-datos-backup",checkAuth,obtenerDatos);
router.post("/restore-db",checkAuth,restablecerDataBase);
router.delete("/eliminar-backup/:id",checkAuth,eliminarBackup);

  
export default router;