import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import moment from "moment";



const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Multer para manejar subidas de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(
        __dirname,
        "../public/uploads/profile-pictures/"
      );
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const currentDate = moment().format('YYYYMMDD');
      const originalnameWithoutExtension = path.parse(file.originalname).name;
      const customFilename = `${originalnameWithoutExtension}-${currentDate}${path.extname(file.originalname)}`;
    
      cb(null, customFilename);
    },
  });
  
  const upload = multer({ storage: storage });
  export default upload;