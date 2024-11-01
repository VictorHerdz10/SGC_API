import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import moment from "moment";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(
      __dirname,
      "../public/documents/contracts/"
    );
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);// Carpeta local temporal
  },
  filename: (req, file, cb) => {
    const currentDate = moment().format('YYYYMMDD');
    const originalnameWithoutExtension = path.parse(file.originalname).name;
    const customFilename = `${originalnameWithoutExtension}-${currentDate}${path.extname(file.originalname)}`;
  
    cb(null, customFilename);
  },
});
const upload = multer({ 
  storage: storage
});
export default upload;