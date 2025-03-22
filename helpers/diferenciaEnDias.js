export default function diferenciaEnDias(fechaISO1, fechaISO2) {
    // Convertir las fechas ISO a objetos Date
    const fecha1 = new Date(fechaISO1);
    const fecha2 = new Date(fechaISO2);

    // Calcular la diferencia en milisegundos
    const diferenciaMs = Math.abs(fecha2.getTime() - fecha1.getTime());

    // Convertir la diferencia de milisegundos a días
    const milisegundosEnUnDia = 86400000; // 1 día = 86,400,000 ms
    const diferenciaDias = Math.floor(diferenciaMs / milisegundosEnUnDia);

    return diferenciaDias;
}