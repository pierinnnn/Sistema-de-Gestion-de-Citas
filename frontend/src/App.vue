<script setup>
import { ref } from 'vue';
import AppointmentList from './components/AppointmentList.vue';
import AppointmentForm from './components/AppointmentForm.vue';
import Swal from 'sweetalert2';
import AppointmentCalendar from './components/AppointmentCalendar.vue';

// Este bloque sirve para manejar la apertura y cierre del formulario, así como para refrescar la lista después de guardar una cita
const isFormOpen = ref(false);
const selectedAppointment = ref(null);
const isEditing = ref(false);
const listComponent = ref(null);
const isReadOnly = ref(false);

const openNewForm = () => {
  selectedAppointment.value = null;
  isEditing.value = false;
  isFormOpen.value = true;
  isReadOnly.value = false;
};

const openEditForm = (appointment) => {
  selectedAppointment.value = appointment;
  isEditing.value = true;
  isFormOpen.value = true;
  isReadOnly.value = false;
};

const openViewForm = (appointment) => {
  selectedAppointment.value = appointment;
  isEditing.value = false;
  isReadOnly.value = true;
  isFormOpen.value = true;
};

const closeForm = () => {
  isFormOpen.value = false;
};

const onSaved = () => {
  isFormOpen.value = false;
  // Limpia la lista para que se vuelva a cargar al abrir el formulario
  listComponent.value?.fetchAppointments();

  Swal.fire({
    position: 'top-end',
    icon: 'success',
    title: isEditing.value ? 'Cita actualizada' : 'Cita programada con éxito',
    showConfirmButton: false,
    timer: 2500,
    toast: true
  });
};
</script>

<template>
  <div class="min-h-screen bg-gray-100 font-sans">
    <header class="bg-white shadow-sm border-b">
      <div class="max-w-7xl mx-auto py-4 px-6 flex justify-between items-center">
        <h1 class="text-2xl font-bold text-indigo-600">Panel de Gestión de Citas</h1>
      </div>
    </header>

    <main class="max-w-7xl mx-auto mt-8">
      <AppointmentList 
        ref="listComponent"
        @open-form="openNewForm" 
        @edit="openEditForm" 
        @view="openViewForm" 
      />

      <AppointmentForm 
        v-if="isFormOpen" 
        :appointment="selectedAppointment" 
        :is-editing="isEditing"
        :is-read-only="isReadOnly"
        @close="isFormOpen = false"
        @saved="onSaved"
      />
    </main>
  </div>
</template>