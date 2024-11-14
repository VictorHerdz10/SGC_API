// controllers/usuarioController.js

import Usuario from "../models/Usuario.js";
import generarJWT from "../helpers/generarJWT.js";
import generarId from "../helpers/generarId.js";
import emailOlvidePassword from "../helpers/emailOlvidePassword.js";
import PerfilUsuario from "../models/PerfiUsuario.js";
import path from "path";
import getDirectLink from "../helpers/generarLink.js";
import { fileURLToPath } from "url";
import { Dropbox } from "dropbox";
import moment from "moment";
import Direccion from "../models/Direccion.js";
import Entidad from "../models/Entidad.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const registrar = async (req, res) => {
  const { email } = req.body;
  // Prevenir usuarios duplicados
  const existeUsuario = await Usuario.findOne({ email });

  if (existeUsuario) {
    const error = new Error("Usuario ya registrado");
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
    });
    await perfil.save();
    if (
      email === "gsanchez@uci.cu" ||
      email === "victorhernandezsalcedo4@gmail.com"
    ) {
      usuario.tipo_usuario = "Admin_Gnl";
      perfil.tipo_usuario = "Admin_Gnl";
      await usuario.save();
      await perfil.save();
    }

    res.json({ msg: "Usuario registrado exitosamente" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Error al registrar el usuario" });
  }
};

const perfil = (req, res) => {
  const { usuario } = req;
  res.json(usuario);
};

const actualizarPerfil = async (req, res) => {
  const { usuario } = req;

  try {
    const token = await Usuario.findOne({ tipo_usuario: "Admin_Gnl" });

    const dbx = await new Dropbox({
      accessToken: token.accessToken,
    });
    let perfil = await PerfilUsuario.findById(usuario._id);
    let usuarioactual = await Usuario.findById(usuario._id);
    if (!perfil && !usuarioactual) {
      return res.status(404).json({ msg: "Perfil y Usuario no encontrado" });
    }
    if (req.body.nombre) {
      // Buscar todas las direcciones asociadas al ejecutivo actual
      const direcciones = await Direccion.find({ ejecutivoId: usuario._id });
      const entidades = await Entidad.find({ ejecutivoId: usuario._id });
      
      // Actualizar cada dirección individualmente
      if (direcciones) {
        await Promise.all(
          direcciones.map(async (direccion) => {
            try {
              const result = await Direccion.findByIdAndUpdate(
                direccion._id,
                { $set: { nombreEjecutivo: req.body.nombre } },
                { new: true }
              );
            } catch (error) {
              console.error(
                `Error al actualizar dirección ${direccion._id}:`,
                error
              );
              return null;
            }
          })
        );
      }

      if (entidades) {
        await Promise.all(
          entidades.map(async (entidad) => {
            try {
              const result = await Entidad.findByIdAndUpdate(
                entidad._id,
                { $set: { nombreEjecutivo: req.body.nombre } },
                { new: true }
              );
            } catch (error) {
              console.error(
                `Error al actualizar dirección ${entidad._id}:`,
                error
              );
              return null;
            }
          })
        );
      }
    }
    // Actualizar información del perfil
    perfil = Object.assign(perfil, req.body);
    usuarioactual = Object.assign(usuario, req.body);

    // Si se envió una imagen, actualizar la URL de la foto de perfil
    if (req.file) {
      if (perfil.originalName === "perfil.png") {
        await perfil.updateOne({}, { $unset: { foto_perfil: "" } });
      } else if (perfil.originalName !== "perfil.png") {
        await dbx.filesDeleteV2({
          path: perfil.dropboxPath,
        });

        console.log(
          "Archivo existente eliminado de la nube:",
          perfil.originalName
        );
        await perfil.updateOne({}, { $unset: { foto_perfil: "" } });
        console.log("actualizado en db");
      }

      // Subir archivo a Dropbox
      const currentDate = moment().format("YYYYMMDD");
      const originalnameWithoutExtension = path.parse(
        req.file.originalname
      ).name;
      const customFilename = `${originalnameWithoutExtension}-${currentDate}${path.extname(
        req.file.originalname
      )}`;

      const uploadedFile = await dbx.filesUpload({
        path: "/uploads/" + customFilename,
        contents: req.file.buffer,
        mode: "add",
        autorename: true,
        mute: true,
      });

      // Obtener el link público del archivo
      const publicLink = await dbx.sharingCreateSharedLinkWithSettings({
        path: uploadedFile.result.path_display,
        settings: {
          requested_visibility: {
            ".tag": "public",
          },
        },
      });

      const directImageLink = getDirectLink(publicLink.result.url);
      perfil.foto_perfil = directImageLink;
      perfil.originalName = req.file.originalname;
      perfil.dropboxPath = uploadedFile.result.path_display;
    }
    await perfil.save();
    await usuarioactual.save();

    res.json({ msg: "Perfil actualizado exitosamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al actualizar el perfil" });
  }
};
const perfilInfo = async (req, res) => {
  const { usuario } = req;
  try {
    const infoperfil = await PerfilUsuario.findById(usuario._id);
    res.json(infoperfil);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al Visualizar el perfil" });
  }
};

const autenticar = async (req, res) => {
  const { email, password } = req.body;

  // Verificar si el usuario existe
  const usuario = await Usuario.findOne({ email });

  if (!usuario) {
    const error = new Error("El usuario no existe");
    return res.status(404).json({ msg: error.message });
  }

  // Revisar el password
  const passwordCorrecta = await usuario.comprobarPassword(password);
  if (passwordCorrecta) {
    // Comprobar si el usuario está confirmado
    if (usuario.tipo_usuario === "Sin Asignar") {
      const error = new Error(
        "Su cuenta no puede acceder al sistema sin los permisos correspondientes"
      );
      return res.status(403).json({ msg: error.message });
    }
    // Autenticar
    const perfil = await PerfilUsuario.findOne({ _id: usuario._id })
      .select("-_id")
      .exec();
    res.json({
      _id: usuario._id,
      nombre: usuario.nombre,
      email: usuario.email,
      tipo_usuario: usuario.tipo_usuario,
      token: generarJWT(usuario._id),
      foto_perfil: perfil.foto_perfil,
      telefono: perfil.telefono,
      cargo: perfil.cargo,
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
    emailOlvidePassword({
      email,
      nombre: existeUsuario.nombre,
      token: existeUsuario.token,
    });
    return res
      .status(200)
      .json({ msg: "Hemos enviado un correo con las instrucciones" });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ msg: "Error al procesar la solicitud de olvidar contraseña" });
  }
};

const comprobarToken = async (req, res) => {
  const { token } = req.params;

  const tokenValido = await Usuario.findOne({ token });

  if (tokenValido) {
    return res.json({
      msg: "Codigo válido. Redireccionando........... ",
      url: `/olvide-password/${token}`,
    });
  } else {
    const error = new Error("Codigo de verificación incorrecto");
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
// Modifica la función visualizarusuarios
const visualizarusuarios = async (req, res) => {
  const { usuario } = req;

  if (usuario.tipo_usuario !== "Admin_Gnl") {
    return res
      .status(400)
      .json({ msg: "No tienes permisos para utilizar esta funcionalidad" });
  }

  try {
    const usuarios = await PerfilUsuario.find();
    // Elimina al usuario actual de la lista
    const filteredUsers = usuarios.filter(
      (user) => user.tipo_usuario.toString() !== "Admin_Gnl"
    );
    res.json(filteredUsers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al visualizar usuarios" });
  }
};

// Función para eliminar usuarios
const eliminarUsuario = async (req, res) => {
  const { id } = req.params;
  const { usuario } = req;
  if (usuario.tipo_usuario !== "Admin_Gnl") {
    return res
      .status(400)
      .json({ msg: "No tienes permisos para eliminar usuarios" });
  }

  try {
    const usuarioToDelete = await Usuario.findById(id);
    const perfilToDelete = await PerfilUsuario.findById(id);

    if (!usuarioToDelete) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }
    await perfilToDelete.deleteOne();
    await usuarioToDelete.deleteOne();
    res.json({ msg: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Error al eliminar usuario" });
  }
};

// Función para asignar roles
const asignarRoles = async (req, res) => {
  const { usuario } = req;
  const { id, rol } = req.body;
  if (usuario.tipo_usuario !== "Admin_Gnl") {
    return res
      .status(400)
      .json({ msg: "No tienes permisos para asignar roles" });
  }

  try {
    const usuarioasignar = await Usuario.findById(id);
    const perfilAsignar = await PerfilUsuario.findById(id);

    if (!usuarioasignar) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }
    if (usuarioasignar.tipo_usuario === rol) {
      return res.status(400).json({
        msg: "El usuario ya tiene asignado este rol, por favor verifique...",
      });
    }
    // Asigna roles al usuario
    usuarioasignar.tipo_usuario = rol;
    perfilAsignar.tipo_usuario = rol;
    await perfilAsignar.save();
    await usuarioasignar.save();
    if (rol === "especialista") {
      const relacionConDirector = await Usuario.findById(req.body.directorId);

      if (!relacionConDirector) {
        return res.status(404).json({ msg: "Director no encontrado" });
      }
      const especialistaRelacionado = await Usuario.findById(id);
      especialistaRelacionado.relacionId = relacionConDirector._id;
      await especialistaRelacionado.save();
      return res.json({ msg: "Rol y permisos asignado  correctamente" });
    }

    return res.json({ msg: "Rol asignado correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Error al asignar roles" });
  }
};

const passchange = async (req, res) => {
  const { usuario } = req;
  const { password, newpassword } = req.body;
  try {
    const usuarioactual = await Usuario.findById(usuario._id);
    //Comprobar password esistente
    const passRigth = await usuarioactual.comprobarPassword(password);
    if (!passRigth) {
      return res
        .status(404)
        .json({ msg: "Su contraseña axtual no coincide, verifiquela" });
    }
    usuarioactual.password = newpassword;
    usuarioactual.save();
    return res.json({ msg: "Contraseña cambiada correctamente" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ msg: "Error al cambiar contraseña" });
  }
};

const ponerToken = async (req, res) => {
  const { token } = req.body;
  try {
    const existe = await Usuario.findOne({ tipo_usuario: "Admin_Gnl" });

    existe.accessToken = token;
    console.log("Token actualizado:");
    await existe.save();
    console.log(existe);
    return res
      .status(200)
      .json({ msg: "Token de archivos agregado o actualizado" });
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ msg: "Error al establecer o actualizar el token" });
  }
};
export {
  registrar,
  autenticar,
  olvidePassword,
  comprobarToken,
  nuevoPassword,
  perfil,
  perfilInfo,
  visualizarusuarios,
  eliminarUsuario,
  asignarRoles,
  actualizarPerfil,
  passchange,
  ponerToken,
};
