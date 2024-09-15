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

    const info = await transporter.sendMail({
       from: 'EduRecord',
       to:email,
       subject: 'Restablece tu password c en nuetro Sistema de Gestion de Expedientes',
       text: 'Restablece tu password',
       html:`<p>Hola: ${nombre}, has solicitado restablecer tu password</p>
            <p>Sigue el siguiente enlace para generar un nuevo password:<a href="${process.env.FRONTEND_URL}/principal/olvide-mi-password/${token}">Restablecer Password</a></p>

            <p>Si tu no creaste esta cuenta puedes ignorar este vensaje. Cuida tu privacidad. Todo facil y seguro</p>
       `,


    })

console.log("Mensaje enviado: %s", info.messageId);

};

export default emailOlvidePassword;