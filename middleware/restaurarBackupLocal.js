import multer from 'multer';
import fs from 'fs';
import path from 'path';

// Asegurarnos de que el directorio temp existe
const tempDir = path.join(process.cwd(), 'temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// Configurar multer para manejar archivos grandes
export const upload = multer({
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB
  },
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, tempDir); // Usar la ruta absoluta
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  })
});