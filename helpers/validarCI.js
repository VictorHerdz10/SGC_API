const validarCi = (ci) => {
  // Extraer información del CI
  const fechaNacimiento = ci.substring(0, 6);
  const siglo = parseInt(ci.substring(6, 7), 10);
  //const digitoControl = parseInt(ci.substring(10, 11), 10);

  // Calcular el dígito de control
 // const pesos = [2, 1, 2, 1, 2, 1, 2, 1, 2, 1];
 // let suma = 0;
 // for (let i = 0; i < 10; i++) {
 //   suma += parseInt(ci[i], 10) * pesos[i];
 // }
 // const modulo = suma % 10;
 // const digitoControlCalculado = modulo === 0 ? 0 : 10 - modulo;
//
 // // Verificar si el dígito de control calculado coincide con el dígito de control del CI
 // if (digitoControl !== digitoControlCalculado) {
 //   return false;
 // }

  // Extraer y ajustar el año de nacimiento
  const dia = parseInt(fechaNacimiento.substring(4, 6), 10);
  const mes = parseInt(fechaNacimiento.substring(2, 4), 10) - 1;
  let anio = parseInt(fechaNacimiento.substring(0, 2), 10);

  if (siglo === 9) {
    anio += 1800;
  } else if (siglo >= 0 && siglo <= 5) {
    anio += 1900;
  } else if (siglo >= 6 && siglo <= 8) {
    anio += 2000;
  }

  // Verificar si la fecha de nacimiento es válida
  const esBisiesto = (anio % 4 === 0 && anio % 100 !== 0) || anio % 400 === 0;

  if (mes < 0 || mes > 11 || dia < 1 || dia > 31) {
    return false;
  }

  if (mes === 1 && !esBisiesto && dia > 28) {
    return false;
  }

  if (mes === 1 && esBisiesto && dia > 29) {
    return false;
  }

  if ((mes === 3 || mes === 5 || mes === 8 || mes === 10) && dia > 30) {
    return false;
  }

  return true;
};

const verificarEdadCi = (ci) => {
  const fechaActual = new Date();
  const siglo = parseInt(ci.substring(6, 7), 10);
  let year = parseInt(ci.substring(0, 2), 10);
  const mesNacimiento = parseInt(ci.substring(2, 4), 10) - 1;
  const diaNacimiento = parseInt(ci.substring(4, 6), 10);

  // Ajustar el año de nacimiento basado en el siglo
  if (siglo >= 6 && siglo <= 8) {
    year += 2000;
  }

  let edad = fechaActual.getFullYear() - year;
  const mesActual = fechaActual.getMonth();

  // Ajustar la edad si el mes de nacimiento es mayor que el mes actual
  if (
    mesNacimiento > mesActual ||
    (mesNacimiento === mesActual && diaNacimiento > fechaActual.getDate())
  ) {
    edad--;
  }

  // Verificar si la edad está entre 12 y 25 años
  if (edad >= 12 && edad <= 18) {
    // Si la edad está dentro del rango, retorno true
    return true;
  } else {
    // Si la edad no está dentro del rango, retorno false
    return false;
  }
};
 export{
    validarCi,
    verificarEdadCi
 }