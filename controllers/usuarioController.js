// controllers/usuarioController.js

import Usuario from "../models/Usuario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailRegistro from "../helpers/emailRegistro.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";
import PerfilUsuario from "../models/PerfiUsuario.js";
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const registrar = async (req, res) => {
    const { email, nombre } = req.body;
    // Prevenir usuarios duplicados
    const existeUsuario = await Usuario.findOne({ email });

    if (existeUsuario) {
        const error = new Error('Usuario ya Registrado');
        return res.status(400).json({ msg: error.message });
    }
    try {
        // Guardar un usuario
        const usuario = await Usuario.create(req.body);
        // Crear un perfil para el usuario
    const perfil = new PerfilUsuario({
        _id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        tipo_usuario: usuario.tipo_usuario,
        telefono: telefono,
        cargo: cargo
      });
      await perfil.save();
        
        // Enviar Email
        emailRegistro({email, nombre, token: usuario.token});
        res.json({msg: "Creado Correctamente, revisa tu email"});   
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error al registrar el usuario" });
    }
};

// Configuración de Multer para manejar subidas de archivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join(__dirname, '../public/uploads/profile-pictures/');
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, uuidv4() + path.extname(file.originalname));
    }
  });
  
  const upload = multer({ storage: storage });
const perfil = async (req, res) => {
    const { _id } = req.usuario;
    
    try {
      let perfil = await PerfilUsuario.findOne({ _id }).select('-_id').exec();
      if (!perfil) {
        return res.status(404).json({ msg: "Perfil no encontrado" });
      }
  
      // Actualizar información del perfil
      perfil = Object.assign(perfil, req.body);
  
      // Si se envió una imagen, actualizar la URL de la foto de perfil
      if (req.file) {
        // Eliminar la imagen anterior si existe
        if (perfil.foto_perfil) {
          const oldImagePath = path.join(__dirname, '../public/', perfil.foto_perfil);
          fs.unlinkSync(oldImagePath);
        }
  
        // Actualizar la URL de la nueva imagen
        perfil.foto_perfil = `/uploads/profile-pictures/${req.file.filename}`;
      }
  
      await perfil.save();
  
      res.json(perfil);
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: "Error al actualizar el perfil" });
    }
  };;

const confirmar = async (req, res) => {
    const { token } = req.body;

    const usuarioConfirmar1 = await Usuario.findOne({ token });

    if (!usuarioConfirmar1) {
        const error = new Error("Token no válido");
        return res.status(404).json({ msg: error.message });
    } 
    try {
        usuarioConfirmar1.token = null;
        usuarioConfirmar1.confirmado = true;
        await usuarioConfirmar1.save();
        res.json({ msg: "Usuario confirmado correctamente" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error al confirmar el usuario" });
    }
};

const autenticar = async (req, res) => {
    const { email, password, tipo_usuario } = req.body;

    // Verificar si el usuario existe
    const usuario = await Usuario.findOne({ email });

    if (!usuario) {
        const error = new Error("El usuario no existe");
        return res.status(404).json({ msg: error.message });
    }

    // Comprobar si el usuario está confirmado
    if (!usuario.confirmado) {
        const error = new Error("La cuenta no ha sido confirmada");
        return res.status(403).json({ msg: error.message });
    }

    // Revisar el password
    const passwordCorrecta = await usuario.comprobarPassword(password);
    if (passwordCorrecta) {
        // Autenticar
        const perfil = await PerfilUsuario.findOne({ _id: usuario._id }).select('-_id').exec();
        res.json({
          id_usuario: usuario._id,
          nombre: usuario.nombre,
          email: usuario.email,
          tipo_usuario: usuario.tipo_usuario,
          token: generarJWT(usuario._id),
          foto_perfil: perfil.foto_perfil,
          telefono: perfil.telefono,
          cargo: perfil.cargo
        });
    } else {
        const error = new Error("La contraseña es incorrecta");
        return res.status(403).json({ msg: error.message });
    }
};

const olvidePassword = async (req, res) => {
    const { email } = req.body;

    const existeUsuario = await Usuario.findOne({ email });

    if (!existeUsuario) {
        const error = new Error("El usuario no existe");
        return res.status(400).json({ msg: error.message });
    }

    try {
        existeUsuario.token = generarId();
        await existeUsuario.save();
        // Enviar Email
        emailOlvidePassword({email, nombre: existeUsuario.nombre, token: existeUsuario.token});
        res.json({ msg: "Hemos enviado un correo con las instrucciones" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error al procesar la solicitud de olvidar contraseña" });
    }
};

const comprobarToken = async (req, res) => {
    const { token } = req.params;

    const tokenValido = await Usuario.findOne({ token });

    if (tokenValido) {
        return res.json({ msg: "Token válido y existe el usuario" });
    } else {
        const error = new Error("Token no válido");
        return res.status(400).json({ msg: error.message });
    }
};

const nuevoPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    const usuario = await Usuario.findOne({ token });

    if (!usuario) {
        const error = new Error("Hubo un error");
        return res.status(400).json({ msg: error.message });
    }
    try {
        usuario.token = null;
        usuario.password = password;
        await usuario.save();
        res.json({ msg: "Contraseña actualizada correctamente" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ msg: "Error al actualizar la contraseña" });
    }
};

export {
    registrar,
    confirmar,
    autenticar,
    olvidePassword,
    comprobarToken,
    nuevoPassword,
    perfil,
    upload
};