import express from "express";
import {
  registrar,
  autenticar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
  upload,
  perfilInfo,
  visualizarusuarios,
  eliminarUsuario,
  asignarRoles,
  actualizarPerfil,
  passchange
} from "../controllers/usuarioController.js";
import checkAuth from "../middleware/authMiddleware.js";

const router = express.Router();
//Area Publica
router.post("/", registrar);
router.post("/login", autenticar);
router.post("/olvide-password", olvidePassword);
router.get("/olvide-password",comprobarToken)
router.post("/olvide-password/:token",nuevoPassword);

//Area Privada
router.put("/actualizar-perfil",checkAuth, upload.single('foto_perfil'), actualizarPerfil);
router.get("/obtener-perfil",checkAuth,perfilInfo);
router.get("/perfil", checkAuth, perfil);
router.post("/cambiar-password",checkAuth,passchange);
//Area Privada del AdminGeneral
router.get("/obtener-usuarios",checkAuth,visualizarusuarios);
router.delete("/eliminar-usuario/:id",checkAuth,eliminarUsuario);
router.get("/asignar-rol",checkAuth,asignarRoles);

export default router;
