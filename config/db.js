// Importar Mongoose y conectar con MongoDB
import mongoose from 'mongoose';
import dotenv from "dotenv";

dotenv.config();

// Conectar con la base de datos MongoDB
const connectDB = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI);
      console.log("Conectado a MongoDB");
    } catch (error) {
      console.error("Error al conectar con MongoDB:", error.message);
      process.exit(1);
    }
  };// Exportar la conexión de MongoDB
export default connectDB;
