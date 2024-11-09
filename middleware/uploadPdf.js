import multer from "multer";

let storage;
const upload = multer({
  storage: storage,
});
export default upload;
