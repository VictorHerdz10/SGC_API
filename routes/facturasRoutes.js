import express from "express";
import checkAuth from "../middleware/authMiddleware.js";
import {
    crearFactura,
    eliminarFactura,
    visualizaFactura,
    modificarFactura,
    advertenciamonto
} from "../controllers/facturasController.js";



const router = express.Router();

//Ruta privada de Facturas
router.post("/",checkAuth,crearFactura);
router.post('/advertencia-monto',checkAuth,advertenciamonto);
router.post("/visualizar-factura",checkAuth,visualizaFactura);
router.put("/modificar-factura",checkAuth,modificarFactura);
router.delete("/eliminar-factura",checkAuth,eliminarFactura);




export default router;