import express from "express";
import checkAuth from "../middleware/authMiddleware.js";

import Traza from "../models/Trazas.js";

const router = express.Router();

//Ruta privada de Entidades
router.get("/", checkAuth, async (req, res) => {
    const{usuario}=req;
    if(usuario.tipo_usuario !== 'Admin_Gnl'){
   return res.status(401).json({msg:"No tienes permisos a acceder a este recurso"})
    }
  try {
    const trazas = await Traza.find();
    return res.status(200).json(trazas);
  } catch (error) {
    return res.status(500).json({ msg: "Hubo un error en obtener las trazas" });
  }
});

export default router;
