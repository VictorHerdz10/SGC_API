import express from "express";
import {
  registrar,
  confirmar,
  autenticar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
  upload,
  perfilInfo,
  visualizarusuarios,
  eliminarUsuario,
  asignarRoles
} from "../controllers/usuarioController.js";
import checkAuth from "../middleware/authMiddleware.js";

const router = express.Router();
//Area Publica
router.post("/", registrar);
router.post("/confirmar", confirmar);
router.post("/login", autenticar);
router.post("/olvide-password", olvidePassword);
router.route("/olvide-password/:token").get(comprobarToken).post(nuevoPassword);

//Area Privada
router.put("/actualizar-perfil",checkAuth, upload.single('foto_perfil'), perfil);
router.get("/obtener-perfil",checkAuth,perfilInfo);
//Area Privada del AdminGeneral
router.get("/obtener-usuarios",checkAuth,visualizarusuarios);
router.delete("/eliminar-usuario/:id",checkAuth,eliminarUsuario);
router.get("/asignar-rol",checkAuth,asignarRoles);

export default router;
