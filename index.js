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
app.use(cookieParser());

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"]
    }
  },
  frameguard: {
    action: 'sameorigin'
  }
}));

// Configuración de sesión (mejorada)
app.use(
  session({
    secret: process.env.SESSION_SECRET || "tu_secreto_seguro_aqui",
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 día
      sameSite: 'strict'
    }
  })
);

dotenv.config();

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));
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

app.use(cors("*"));
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
