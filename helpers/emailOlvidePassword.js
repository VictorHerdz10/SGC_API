import nodemailer from 'nodemailer';

const emailOlvidePassword = async(datos)=>{
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        }
      });
    const{email,nombre, token}= datos;
    //Enviar el email
   console.log(token)
    const info = await transporter.sendMail({
      from: 'contractUci',
      to: email,
      subject: 'Restablece tu contraseña en nuestro Sistema de Gestión de Contratos',
      text: 'Restablece tu contraseña',
      html: `
        <p>Hola: ${nombre}, has solicitado restablecer tu contraseña</p>
        <p>Sigue el siguiente enlace para generar una nueva contraseña:</p>
        <p><a href="${process.env.FRONTEND_URL}/principal/olvide-mi-password/${token}">Restablecer Contraseña</a></p>
        
        <p>Si no creaste esta cuenta, ignora este mensaje. Cuida tu privacidad. Todo fácil y seguro.</p>
      `,
    });

console.log("Mensaje enviado: %s", info.messageId);

};

export default emailOlvidePassword;