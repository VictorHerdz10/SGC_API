import express from "express";
import checkAuth from "../middleware/authMiddleware.js";
import {
  registrarContrato,
  obtenerRegistroContratos,
  actualizarRegistroContrato,
  eliminarRegistroContrato,
  obtenerContratosPorEntidad,
  obtenerContratosPorEstado,
  obtenerContratosPorDireccion,
  obtenerContratosPorValorTotal,
  obtenerContratosPorValorDisponible,
  obtenerContratosPorValorGastado,
  notificarcontratos
} from "../controllers/registrosContratosController.js";
import upload from "../middleware/upload.js";
import { subirArchivo } from "../middleware/archivosubidor.js";

const router = express.Router();

//Ruta Privada
router.post("/", checkAuth, upload.single("subirPDF"), registrarContrato);
router.get("/listar-registro-contratos", checkAuth, obtenerRegistroContratos);
router.put(
  "/actualizar-registro-contrato/:id",
  checkAuth,
  subirArchivo,
  upload.single("subirPDF"),
  actualizarRegistroContrato
);
router.delete(
  "/eliminar-registro-contrato/:id",
  checkAuth,
  eliminarRegistroContrato
);
router.get(
  "/filtrar-contrato-por-entidad/:entidad",
  checkAuth,
  obtenerContratosPorEntidad
);
router.get(
  "/filtrar-contratos-por-estado/:estado",
  checkAuth,
  obtenerContratosPorEstado
);
router.get(
  "/filtrar-contratos-por-direccion/:direccionEjecuta",
  checkAuth,
  obtenerContratosPorDireccion
);
router.get(
  "/filtrar-contratos-por-valor-total/:valor/:tipo/:valorFin",
  checkAuth,
  obtenerContratosPorValorTotal
);
router.get(
  "/filtrar-contratos-por-valor-disponible/:valorDisponible/:tipo/:valorFin",
  checkAuth,
  obtenerContratosPorValorDisponible
);
router.get(
  "/filtrar-contratos-por-valor-gastado/:valorGastado/:tipo/:valorFin",
  checkAuth,
  obtenerContratosPorValorGastado
);

router.get("/notificacion-contratos",checkAuth,notificarcontratos);
export default router;
