<script setup>
import { watch, ref, onMounted } from 'vue';
import { appointmentService } from '../services/appointmentService';
import ConflictAlert from './ConflictAlert.vue';

const props = defineProps(['appointment', 'isEditing', 'isReadOnly']);
const emit = defineEmits(['close', 'saved']);

const form = ref({
    patientName: '',
    doctorName: '',
    date: '',
    startTime: '',
    endTime: '',
    reason: '',
    status: 'scheduled'
});

const conflicts = ref([]);
const errorMessage = ref('');

// Cargamos datos si es edición
onMounted(() => {
    if (( props.isReadOnly || props.isEditing) && props.appointment) {
        // Formateamos la fecha para que el input type="date" la entienda
        const formattedDate = new Date(props.appointment.date).toISOString().split('T')[0];
        form.value = { ...props.appointment, date: formattedDate };
    }
});

const handleSubmit = async () => {
    try {
        conflicts.value = [];
        errorMessage.value = '';

        if (props.isEditing) {
            // IMPORTANTE: Para editar usamos PUT y pasamos el ID
            await appointmentService.update(props.appointment._id, form.value);
        } else {
            // Para crear usamos POST
            await appointmentService.create(form.value);
        }
        
        // Solo si la petición es exitosa, avisamos al padre para cerrar y refrescar
        emit('saved');
    } catch (err) {
        if (err.response?.status === 409) {
            conflicts.value = err.response.data.conflicts;
        } else {
            errorMessage.value = err.response?.data?.message || 'Error en el servidor';
        }
    }
};

const checkLiveConflicts = async () => {
    if (props.isReadOnly) {
        conflicts.value = [];
        return;
    }

    const { doctorName, date, startTime, endTime } = form.value;
    if (doctorName && date && startTime && endTime) {
        try {
            const params = { doctorName, date, startTime, endTime };
            if (props.isEditing && props.appointment?._id) {
                params.excludeId = props.appointment._id;
            }
            
            const { data } = await appointmentService.checkConflicts(params);
            conflicts.value = data; 
        } catch (e) {
            console.error("Error validando", e);
        }
    }
};

watch([() => form.value.doctorName, () => form.value.date, () => form.value.startTime, () => form.value.endTime], () => {
    if (props.isReadOnly) return; 
    checkLiveConflicts();
});
</script>

<template>
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 border border-slate-100 overflow-y-auto max-h-[90vh]">
            <h2 class="text-2xl font-bold text-slate-800 mb-6">
                {{ isReadOnly ? 'Detalles de la Cita' : (isEditing ? 'Editar Cita' : 'Nueva Cita') }}
            </h2>
            
            <form @submit.prevent="handleSubmit" class="space-y-4">
                <div>
                    <label class="block text-sm font-semibold text-slate-700">Nombre del Paciente</label>
                    <input v-model="form.patientName" :disabled="isReadOnly" required class="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-indigo-500 outline-none transition-all">
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-slate-700">Doctor</label>
                        <input v-model="form.doctorName" :disabled="isReadOnly" required class="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-indigo-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-700">Fecha</label>
                        <input type="date" v-model="form.date" :disabled="isReadOnly" required class="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-indigo-500 outline-none">
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <label class="block text-sm font-semibold text-slate-700">Hora Inicio</label>
                        <input type="time" v-model="form.startTime" :disabled="isReadOnly" required class="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-indigo-500 outline-none">
                    </div>
                    <div>
                        <label class="block text-sm font-semibold text-slate-700">Hora Fin</label>
                        <input type="time" v-model="form.endTime" :disabled="isReadOnly" required class="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-indigo-500 outline-none">
                    </div>
                </div>

                <div>
                    <label class="block text-sm font-semibold text-slate-700">Motivo de la consulta</label>
                    <textarea v-model="form.reason" :disabled="isReadOnly" required rows="2" class="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-indigo-500 outline-none"></textarea>
                </div>

                <div v-if="isEditing">
                    <label class="block text-sm font-semibold text-slate-700">Estado de la Cita</label>
                    <select v-model="form.status" :disabled="isReadOnly" class="w-full border-2 border-slate-200 p-3 rounded-xl focus:border-indigo-500 outline-none bg-white">
                        <option value="scheduled">Programada</option>
                        <option value="completed">Completada</option>
                        <option value="cancelled">Cancelada</option> </select>
                </div>

                <ConflictAlert v-if="conflicts.length > 0" :conflicts="conflicts" @close="conflicts = []" />
                <p v-if="errorMessage" class="text-red-500 text-sm font-bold bg-red-50 p-2 rounded">❌ {{ errorMessage }}</p>
                
                <div class="flex justify-end space-x-3 pt-6 border-t">
                    <button type="button" @click="$emit('close')" class="px-6 py-3 text-slate-500 font-bold hover:text-slate-800">
                        {{ isReadOnly ? 'Cerrar' : 'Cancelar' }}
                    </button>
                    <button v-if="!isReadOnly" type="submit" class="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700">
                        {{ isEditing ? 'Actualizar' : 'Guardar' }}
                    </button>
                </div>
            </form>
        </div>
    </div>
</template>