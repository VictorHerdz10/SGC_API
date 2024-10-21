import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(
      __dirname,
      "../public/documents/contracts/"
    );
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const customfilename = `${path.basename(file.originalname)}`;
    cb(null, customfilename);
  },
});
const upload = multer({ 
  storage: storage,
  fileFilter(req, file, cb) {
    // Verificar si el archivo está permitido
    if (!file.originalname.match(/\.(pdf)$/)) {
      return cb(new Error('Solo se permiten archivos PDF o DOCX'));
    }
    cb(null, true);
  }
});
export default upload;