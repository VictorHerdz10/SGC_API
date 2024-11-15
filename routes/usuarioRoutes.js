import express from "express";
import {
  registrar,
  autenticar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
  perfilInfo,
  visualizarusuarios,
  eliminarUsuario,
  asignarRoles,
  actualizarPerfil,
  passchange,
  ponerToken,
  imagen
} from "../controllers/usuarioController.js";
import checkAuth from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadImg.js";

const router = express.Router();
//Area Publica
router.post("/", registrar);
router.post("/login", autenticar);
router.post("/olvide-password", olvidePassword);
router.get("/olvide-password/:token",comprobarToken)
router.post("/nuevo-password/:token",nuevoPassword);

//Area Privada
router.put("/actualizar-perfil",checkAuth, upload.single('foto_perfil'), actualizarPerfil);
router.get("/obtener-perfil",checkAuth,perfilInfo);
router.get("/perfil", checkAuth, perfil);
router.post("/cambiar-password",checkAuth,passchange);
//Area Privada del AdminGeneral
router.get("/obtener-usuarios",checkAuth,visualizarusuarios);
router.delete("/eliminar-usuario/:id",checkAuth,eliminarUsuario);
router.post("/asignar-rol",checkAuth,asignarRoles);
router.post("/poner-token",checkAuth,ponerToken);
router.post("/foto",upload.single('foto'),imagen);

export default router;
