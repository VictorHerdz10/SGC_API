import express from "express";
import {
  registrar,
  confirmar,
  autenticar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
  upload
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
router.put("/actualizar-perfil", checkAuth, upload.single('foto_perfil'), perfil);

export default router;
