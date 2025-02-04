export function convertirVigencia(vigencia) {
    // Convertir el string a minúsculas para manejar mayúsculas y minúsculas
    vigencia = vigencia.toLowerCase();
  
    // Separar el número de la unidad de tiempo
    const partes = vigencia.split(" ");
    const numero = partes[0]; // Obtener el número (ejemplo: "1")
    const unidad = partes[1]; // Obtener la unidad de tiempo (ejemplo: "year")
  
    // Convertir la unidad de tiempo
    let nuevaUnidad;
    if (unidad.includes("month")) {
      nuevaUnidad = numero === "1" ? "mes" : "meses";
    } else if (unidad.includes("year")) {
      nuevaUnidad = numero === "1" ? "año" : "años";
    } else {
      // Si no es "month" ni "year", devolver el string original
      return vigencia;
    }
  
    // Reconstruir el string
    return `${numero} ${nuevaUnidad}`;
  }