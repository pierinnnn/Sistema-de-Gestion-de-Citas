// Ejemplo de test unitario para la lógica de negocio
import { timeToMinutes } from '../utils/timeHelper.js';

describe('Time Helper Test', () => {
  test('Debe convertir correctamente 09:30 a 570 minutos', () => {
    const minutes = timeToMinutes('09:30');
    expect(minutes).toBe(570);
  });

  test('Debe fallar si la hora de fin es menor a la de inicio', () => {
    const start = timeToMinutes('10:00');
    const end = timeToMinutes('09:00');
    expect(end).toBeLessThan(start);
  });
});