export const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // Utilizamos un formato local
    return date.toLocaleDateString('es-PE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: 'UTC'
    });
};

// Los inputs de tipo date requieren un formato específico (YYYY-MM-DD), por lo que esta función convierte una fecha a ese formato
export const toInputDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
};