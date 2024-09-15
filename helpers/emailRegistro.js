import nodemailer from 'nodemailer';

const emailRegistro = async (datos)=>{
  const {email,nombre,token} = datos;
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });
 // Enviar el email
const info = await transporter.sendMail({
  from: 'contractUci',
  to: email,
  subject: 'Comprueba tu cuenta en nuestro Sistema de Gestion de Contratos',
  text: 'Comprueba tu cuenta en nuestro Sistema de Gestion de Contratos',
  html: `
    <p>Hola: ${nombre}, comprueba tu cuenta para poder acudir a nuestros servicios</p>
    <p>Tu código de confirmación es: ${token}</p>
    
    <p>Por favor, ingresa este código en el formulario de confirmación:</p>
    <p><strong>${token}</strong></p>
    
    <p>Si tu no creaste esta cuenta, ignora este mensaje. Cuida tu privacidad. Todo fácil y seguro.</p>
  `,
})

console.log("Mensaje enviado: %s", info.messageId);
  } catch (error) {
    console.error("Error al enviar el correo electrónico:");
    console.log(error);
    
  }
    

};

export default emailRegistro;