<script setup>
import { ref, onMounted, watch } from 'vue';
import { appointmentService } from '../services/appointmentService';
import { formatDate } from '../utils/dateFormatter';
import Swal from 'sweetalert2';

const appointments = ref([]);
const currentPage = ref(1);
const totalPages = ref(1);
const totalResults = ref(0);
const filters = ref({ date: '', doctorName: '', status: '' });
let debounceTimer = null;

// Bonus: Busqueda en tiempo real (debounced)
watch(() => filters.value.doctorName, () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        fetchAppointments();
    }, 500);
});

// Funcion para cargar las citas desde el backend, aplicando los filtros y la paginacion
const fetchAppointments = async () => {
    try {
        const params = {
            ...filters.value,
            page: currentPage.value,
            limit: 5
        };
        const { data } = await appointmentService.getAll(params);
        
        appointments.value = data.appointments; 
        totalPages.value = data.pages;
        totalResults.value = data.total;
        
    } catch (error) {
        console.error("Error al cargar citas:", error);
    }
};

// Funcion para cambiar de pagina, actualiza el numero de pagina y recarga las citas
const changePage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        fetchAppointments();
    }
};

// Funcion para formatear la fecha en el template
const confirmDelete = async (id) => {
    const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: "Esta acción no se puede revertir.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#f43f5e',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        reverseButtons: true
    });

    if (result.isConfirmed) {
        try {
            await appointmentService.delete(id);
            fetchAppointments();
            Swal.fire({
                title: 'Eliminado',
                text: 'La cita ha sido eliminada con éxito.',
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (error) {
            Swal.fire('Error', 'No se pudo eliminar la cita.', 'error');
        }
    }
};

// Funcion para obtener la configuracion de estilo y texto segun el estado de la cita, se usa en el template para mostrar un badge con el estado
const getStatusClass = (status) => {
    const configs = {
        scheduled: {
            label: 'Programada',
            classes: 'bg-blue-50 text-blue-700 border-blue-200',
            icon: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
        },
        completed: {
            label: 'Completada',
            classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            icon: 'M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
        },
        cancelled: {
            label: 'Cancelada',
            classes: 'bg-rose-50 text-rose-700 border-rose-200',
            icon: 'm9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z'
        }
    };
    return configs[status] || configs.scheduled;
};

onMounted(fetchAppointments);

defineExpose({ fetchAppointments });
</script>

<template>
    <div class="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div class="p-6">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <input v-model="filters.doctorName" @input="fetchAppointments" placeholder="Buscar por doctor..." class="border-2 border-slate-200 p-2 rounded-xl focus:border-indigo-500 outline-none">
                <input v-model="filters.date" type="date" @change="fetchAppointments" class="border-2 border-slate-200 p-2 rounded-xl focus:border-indigo-500 outline-none">
                <select v-model="filters.status" @change="fetchAppointments" class="border-2 border-slate-200 p-2 rounded-xl focus:border-indigo-500 outline-none">
                    <option value="">Todos los estados</option>
                    <option value="scheduled">Programada</option>
                    <option value="completed">Completada</option>
                    <option value="cancelled">Cancelada</option>
                </select>
                <button @click="$emit('open-form')" class="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-all">
                    + Nueva Cita
                </button>
            </div>

            <div class="mt-8 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200 bg-white">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Paciente</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha / Hora</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-gray-100">
                            <tr v-for="app in appointments" :key="app._id" class="hover:bg-slate-100 transition-colors">
                                <td class="px-6 py-4" >{{ app.patientName }}</td>
                                <td class="px-6 py-4">{{ app.doctorName }}</td>
                                <td class="px-6 py-4">
                                    {{ formatDate(app.date) }} 
                                    <span class="text-slate-400 font-normal ml-1">({{ app.startTime }} - {{ app.endTime }})</span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span :class="['inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border', getStatusClass(app.status).classes]">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5">
                                            <path stroke-linecap="round" stroke-linejoin="round" :d="getStatusClass(app.status).icon" />
                                        </svg>
                                        {{ getStatusClass(app.status).label }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <div class="flex items-center space-x-3 justify-start">
                                        <button @click="$emit('view', app)" class="text-blue-600 hover:text-blue-900 transition-transform hover:scale-110" title="Ver detalles">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                            </svg>
                                        </button>

                                        <button @click="$emit('edit', app)" class="text-indigo-600 hover:text-indigo-900 transition-transform hover:scale-110" title="Editar cita">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                                            </svg>
                                        </button>

                                        <button @click="confirmDelete(app._id)" class="text-rose-600 hover:text-rose-900 transition-transform hover:scale-110" title="Eliminar cita">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                            </svg>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="appointments.length === 0">
                                <td colspan="5" class="px-6 py-10 text-center text-slate-500 italic">
                                    No se encontraron citas con los filtros seleccionados.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div class="flex justify-between items-center p-4 bg-slate-50 border-t">
                        <button @click="changePage(currentPage - 1)" :disabled="currentPage === 1" class="px-4 py-2 bg-white border rounded-lg disabled:opacity-50">Anterior</button>
                        <span class="text-sm font-medium">Página {{ currentPage }} de {{ totalPages }}</span>
                        <button @click="changePage(currentPage + 1)" :disabled="currentPage === totalPages" class="px-4 py-2 bg-white border rounded-lg disabled:opacity-50">Siguiente</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>