import express from "express";
import cors from "cors";
import path from "path";
import connectDB from "./config/db.js";
import dotenv from "dotenv";
import usuarioRoutes from "./routes/usuarioRoutes.js";
import registrosContratosRoutes from "./routes/registrosContratosRoutes.js";
import facturasRoutes from "./routes/facturasRoutes.js";
import entidadRoutes from "./routes/entidadRoutes.js";
import direccionRoutes from "./routes/direccionRoutes.js";
import bodyParser from "body-parser";
import fs from "fs/promises";
import cron from 'node-cron';
import dailyTask from "./config/config-con.js";

//Creando instancia de express
const app = express();
app.use(express.json());
dotenv.config();
// Middleware para parsear form-data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
//Configurar la ruta base para servir archivos estáticos
const __filename = import.meta.url;
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, "public");
app.use(express.static(publicDir));
// Configura el cliente de Dropbox

  // Arrancar la tarea cron al iniciar la aplicación
cron.schedule(dailyTask.schedule, dailyTask.task);

console.log('Cron task started successfully');

connectDB()
  .then(() => console.log("Conexión a la base de datos establecida con éxito."))
  .catch((err) =>
    console.error("No se pudo conectar a la base de datos:", err)
  );
 const dominiosPermitidos = [process.env.FRONTEND_URL];
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

app.use(cors(corsOptions));
app.use("/api/usuario", usuarioRoutes);
app.use("/api/contratos", registrosContratosRoutes);
app.use("/api/facturas", facturasRoutes);
app.use("/api/entidad", entidadRoutes);
app.use("/api/direccion", direccionRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
