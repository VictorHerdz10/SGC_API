import nodemailer from "nodemailer";
import { readTemplate } from "../helpers/compileTemplate.js"; // Importa la función para leer la plantilla

const emailOlvidePassword = async (datos) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const { email, nombre, token } = datos;

  // Compila la plantilla con los datos
  const html = readTemplate("emailTemplate", { nombre, token });

  try {
    // Enviar el email
    const info = await transporter.sendMail({
      from: `SGC <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Restablece tu contraseña en nuestro Sistema de Gestión de Contratos",
      text: "Restablece tu contraseña",
      html: html,
    });

    console.log("Mensaje enviado: %s", info.messageId);
  } catch (error) {
    console.error("Error al enviar el correo:", error);
  }
};

export default emailOlvidePassword;