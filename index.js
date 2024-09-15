import express from "express";
import cors from "cors";
import path from 'path';
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import usuarioRoutes from "./routes/usuarioRoutes.js";

//Creando instancia de express
const app = express();
app.use(express.json());
dotenv.config();
// Configurar la ruta base para servir archivos estáticos
const __filename = import.meta.url;
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));
// Prueba la conexión a la base de datos
connectDB()
.then(() => console.log("Conexión a la base de datos establecida con éxito."))
  .catch( err =>
    console.error("No se pudo conectar a la base de datos:", err)
  );
  /* const dominiosPermitidos = ["http://localhost:3000"];
  const corsOptions = {
    origin: function(origin, callback){
      if(dominiosPermitidos.indexOf(origin) !== -1){
        //El origen del Requet esta permitido
        callback(null,true);
    }else{
      callback(new Error('No permitido por CORS'))
    }
  }
  }
app.use(cors(corsOptions));*/
  app.use("/api/usuario", usuarioRoutes);
  /*app.use("/api/expediente", expedienteRoutes);
  app.use("/api/solicitud",solicitudRoutes);
  app.use("/api/boletaMovimiento",boletaMovimientoRoutes);*/

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
