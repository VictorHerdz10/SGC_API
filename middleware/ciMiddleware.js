// ciMiddleware.js
import { validarCi, verificarEdadCi } from "../helpers/validarCI.js";

const ciVerificar = async (req, res, next) => {
 const { ci } = req.body;
 try {
    if (!validarCi(ci)) {
      return res.status(400).json({ msg: "Su Ci introducido no es valido, reviselo por favor" }); // Utiliza return para salir de la función
    }
    if (!verificarEdadCi(ci)) {
      return res.status(400).json({ msg: "Los estudiantes solo pueden estar dentro den rango de edad de 12 a 18" }); // Utiliza return para salir de la función
    }
    return next(); // Asegúrate de que next() se llame solo si no hay errores
 } catch (error) {
    return res.status(500).json({ msg: "Error en validar CI" }); // Utiliza return para salir de la función
 }
};

export default ciVerificar;