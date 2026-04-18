import axios from 'axios';

const API_URL = 'http://localhost:3000/api/appointments';

// Creamos los metodos que se van a usar para interactuar con la API
export const appointmentService = {
    // Obtener todas las citas
    getAll(params) {
        return axios.get(API_URL, { params });
    },
    // Crear nueva cita
    create(data) {
        return axios.post(API_URL, data);
    },
    // Verificar conflictos en tiempo real
    checkConflicts(params) {
        return axios.get(`${API_URL}/conflicts/check`, { params });
    },
    // Actualizar cita existente
    update(id, data) {
        return axios.put(`${API_URL}/${id}`, data);
    },
    // Eliminar cita
    delete(id) {
        return axios.delete(`${API_URL}/${id}`);
    }
}