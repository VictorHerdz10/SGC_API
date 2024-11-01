import express from "express";
import checkAuth from "../middleware/authMiddleware.js";
import {
    crearDireccion,
    eliminarDireccion,
    obtenerDirecciones,
    modificarDireccion,
} from "../controllers/direccionController.js";



const router = express.Router();

//Ruta privada de Facturas
router.post("/",checkAuth,crearDireccion);
router.get("/obtener-direcciones",checkAuth,obtenerDirecciones);
router.put("/modificar-direccion/:id",checkAuth,modificarDireccion);
router.delete("/eliminar-direccion/:id",checkAuth,eliminarDireccion);




export default router;