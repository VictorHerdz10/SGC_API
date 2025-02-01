import {v2 as cloudinary} from 'cloudinary';
import Usuario from '../models/Usuario.js';
let name;
let api;
let secret;

const obtenerCredenciales = async()=>{
    const user = await Usuario.findOne({where:{tipo_usuario:'Admin_Gnl'}});
    name = user?.cloud_name || '';
    api = user?.api_key|| '';
    secret = user?.api_secret|| '';
}
obtenerCredenciales()
          
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME || name,
  api_key: process.env.CLOUDINARY_API_KEY || api,
  api_secret: process.env.CLOUDINARY_API_SECRET || secret,
});

export default cloudinary