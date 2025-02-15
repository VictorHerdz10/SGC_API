import express from "express";
import checkAuth from "../middleware/authMiddleware.js";
import {
  registrarContrato,
  obtenerRegistroContratos,
  actualizarRegistroContrato,
  eliminarRegistroContrato,
  obtenerContratosFiltrados,
  notificarcontratos,
  marcarComoLeidas,
  marcarleidasAll
} from "../controllers/registrosContratosController.js";
import upload from "../middleware/uploadPdf.js";
const router = express.Router();

//Ruta Privada
router.post("/", checkAuth, upload.single("subirPDF"), registrarContrato);
router.get("/listar-registro-contratos/:tipoContrato", checkAuth, obtenerRegistroContratos);
router.put(
  "/actualizar-registro-contrato/:id",
  checkAuth,
  upload.single("subirPDF"),
  actualizarRegistroContrato
);
router.delete(
  "/eliminar-registro-contrato/:id",
  checkAuth,
  eliminarRegistroContrato
);
router.post(
  "/filtrar-contratos",
  checkAuth,
  obtenerContratosFiltrados
);

router.get("/notificacion-contratos",checkAuth,notificarcontratos);
router.get("/marcar-leida/:id",checkAuth,marcarComoLeidas);
router.get('/marcar-leidas-all',checkAuth,marcarleidasAll)
export default router;
