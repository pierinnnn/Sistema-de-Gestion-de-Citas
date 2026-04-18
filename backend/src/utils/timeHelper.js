// Agregamos una funcion para convertir el tiempo (HH:MM) a solo minutos, de modo que se facilitan las comparaciones
export const timeToMinutes = (timeStr) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
};