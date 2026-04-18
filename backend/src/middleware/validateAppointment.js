export const validateFields = (req, res, next) => {
    const { patientName, doctorName, date, startTime, endTime, reason } = req.body;
    
    // Validamos que todos los campos requeridos por el modelo existan
    if (!patientName || !doctorName || !date || !startTime || !endTime || !reason) {
        return res.status(400).json({ 
            message: "Error de validación: Faltan campos obligatorios (nombre, doctor, fecha, horas o motivo)." 
        });
    }
    
    next();
};