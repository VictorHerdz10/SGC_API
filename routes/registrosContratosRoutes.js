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
  marcarleidasAll,
  getSuplementosByContrato,
  crearSuplemento,
  actualizarSuplemento,
  eliminarSuplemento,
  useSupplement,
  obtenerEspecificos
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
router.get('/marcar-leidas-all',checkAuth,marcarleidasAll);

//Suplementos
router.get('/suplementos/:id',checkAuth,getSuplementosByContrato);
router.get('/suplementos/usar/:id',checkAuth,useSupplement);
router.post('/suplementos/:id',checkAuth, crearSuplemento);
router.put('/suplementos/:id',checkAuth, actualizarSuplemento);
router.delete('/suplementos/:id',checkAuth, eliminarSuplemento);

// routes/contratos.js
router.get('/marco/:id/especificos',checkAuth, obtenerEspecificos);


export default router;
