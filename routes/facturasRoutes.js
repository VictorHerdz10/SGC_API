import express from "express";
import checkAuth from "../middleware/authMiddleware.js";
import {
    crearFactura,
    eliminarFactura,
    visualizaFactura,
    modificarFactura,
    advertenciamontoCrear,
    advertenciamontoModificar
} from "../controllers/facturasController.js";



const router = express.Router();

//Ruta privada de Facturas
router.post("/crear-factura",checkAuth,crearFactura);
router.post('/advertencia-monto-crear',checkAuth,advertenciamontoCrear);
router.post('/advertencia-monto-modificar',checkAuth,advertenciamontoModificar);
router.post("/visualizar-factura",checkAuth,visualizaFactura);
router.put("/modificar-factura",checkAuth,modificarFactura);
router.delete("/eliminar-factura/:contratoId",checkAuth,eliminarFactura);




export default router;