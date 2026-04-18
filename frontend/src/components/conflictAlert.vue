<script setup>
// Definimos las props que recibe el componente
defineProps({
    conflicts: {
        type: Array,
        required: true
    }
});

// Definimos el evento para cerrar la alerta
defineEmits(['close']);
</script>

<template>
    <div class="bg-red-50 border-l-4 border-red-500 p-4 my-4 rounded-r-xl shadow-sm animate-pulse-subtle">
        <div class="flex justify-between items-start">
            <div class="flex">
                <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
                    </svg>
                </div>
                <div class="ml-3">
                    <h3 class="text-sm font-bold text-red-800 uppercase tracking-tight">
                        Conflicto de Horario Detectado
                    </h3>
                    <div class="mt-2 text-sm text-red-700">
                        <p class="mb-2 font-medium">El doctor ya tiene las siguientes citas en ese rango:</p>
                        <ul class="list-disc list-inside space-y-1">
                            <li v-for="c in conflicts" :key="c._id" class="bg-white/50 p-1 rounded">
                                <span class="font-bold">{{ c.startTime }} - {{ c.endTime }}</span>
                                <span class="ml-1 opacity-80">(Paciente: {{ c.patientName }})</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <button @click="$emit('close')" class="text-red-400 hover:text-red-600 transition-colors px-2 text-xl font-bold">
                &times;
            </button>
        </div>
    </div>
</template>

<style scoped>
@keyframes pulse-subtle {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.95; }
}
.animate-pulse-subtle {
    animation: pulse-subtle 2s infinite ease-in-out;
}
</style>