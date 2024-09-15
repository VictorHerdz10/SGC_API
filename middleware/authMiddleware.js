// authMiddleware.js
import Jwt from "jsonwebtoken";
import Usuario from "../models/Usuario.js";

const checkAuth = async (req, res, next) => {
 let token;
 if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
  token = req.headers.authorization.split(" ")[1];
  
    try {
      const decoded = Jwt.verify(token, process.env.JWT_SECRET);
      req.usuario = await Usuario.findById(decoded.id).select('-password -token -confirmado');
    
      return next(); // Asegúrate de que next() se llame solo si no hay errores
    } catch (error) {
      return res.status(403).json({ msg: "Token no valido" }); // Utiliza return para salir de la función
    }
 }
 if (!token) {
    return res.status(403).json({ msg: "Token no valido o inexistente" }); // Utiliza return para salir de la función
 }
 return next(); // Asegúrate de que next() se llame solo si no hay errores
};

export default checkAuth;
