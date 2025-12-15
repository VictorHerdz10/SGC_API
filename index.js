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
import helmet from "helmet";
import cron from 'node-cron';
import dailyTask from "./config/config-con.js";
import backupRoutes from './routes/backupRoutes.js'
import session from "express-session";
import cookieParser from "cookie-parser";
import trazaRoutes from './routes/trazasRoutes.js'
import tipoContratoRoutes from './routes/tipoContratoRoutes.js'

//Creando instancia de express
const app = express();
app.use(express.json());
app.use(cookieParser())
app.use(helmet({
  frameguard: {
    action: 'sameorigin'
  }
}));
app.use(
  session({
    secret: "tu_secreto",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Cambia a true si usas HTTPS
  })
);

dotenv.config();
// Middleware para parsear form-data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
  // Arrancar la tarea cron al iniciar la aplicación
cron.schedule(dailyTask.schedule, dailyTask.task);

console.log('Cron task started successfully');

connectDB()
  .then(() => console.log("Conexión a la base de datos establecida con éxito."))
  .catch((err) =>
    console.error("No se pudo conectar a la base de datos:", err)
  );


const corsOptions = {
  origin: [
    'https://registroscontratosdgs.netlify.app',
    'http://localhost:3000', // Para desarrollo local
    // Agrega otros dominios si los tienes
  ],
  credentials: true, // Si usas cookies/sesiones
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use("/api/usuario", usuarioRoutes);
app.use("/api/contratos", registrosContratosRoutes);
app.use("/api/facturas", facturasRoutes);
app.use("/api/entidad", entidadRoutes);
app.use("/api/direccion", direccionRoutes);
app.use("/api/backup", backupRoutes);
app.use("/api/tipo-contrato", tipoContratoRoutes);
app.use("/api/trazas", trazaRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
