import express from "express";
import checkAuth from "../middleware/authMiddleware.js";
import {
  crearContrato,
  obtenerContratos,
  actualizarContrato,
  eliminarContrato,
  obtenerContratoPorId,
  obtenerContratosPorContratista,
  obtenerContratosPorClienteAfiliado,
  obtenerContratosPorCategorias,
  obtenerContratosPorPresupuesto
} from "../controllers/contratoController.js";

const router = express.Router();
//Ruta Privada
router.post("/", checkAuth, crearContrato);
router.get("/listar-contratos", checkAuth, obtenerContratos);
router.get("/visualizar-contrato/:id", checkAuth, obtenerContratoPorId);
router.put("/actualizar-contrato/:id", checkAuth, actualizarContrato);
router.delete("/eliminar-contrato/:id", checkAuth, eliminarContrato);
router.get(
  "/filtrar-contrato-por-contratista/:contratista",
  checkAuth,
  obtenerContratosPorContratista
);
router.get(
  "/filtrar-contratos-por-cliente/:clienteAfiliado",
  checkAuth,
  obtenerContratosPorClienteAfiliado
);
router.get(
  "/filtrar-contratos-por-categorias/:categoria",
  checkAuth,
  obtenerContratosPorCategorias
);
router.get(
  "/filtrar-contratos-por-presupuesto/:presupuesto/:tipo",
  checkAuth,
  obtenerContratosPorPresupuesto
);
export default router;
