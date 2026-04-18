import Appointment from '../models/Appointment.js';
import { timeToMinutes } from '../utils/timeHelper.js';

// Función principal encargada de validar conflictos de citas, tanto para creación como para actualización
const validateConflict = async (data, excludeId = null) => {
    const { doctorName, date, startTime, endTime } = data;
    // Validamos que se pase la informacion
    if (!doctorName || !date || !startTime || !endTime) return { error: 'Faltan campos' };

    // Llamamos a la funcion del timeHelper que convierte la hora en minutos
    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);

    // Validacion basica
    if (endMin <= startMin) return { error: 'La hora de fin debe ser posterior a la de inicio.' };

    // Comparamos la fecha actual con la de la cita
    const appDate = new Date(date);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (appDate < today) return { error: 'La fecha no puede ser anterior al día actual.' };

    // Buscamos citas del mismo doctor y fecha, excluyendo la actual
    let query = { doctorName, date: appDate };
    if (excludeId) query._id = { $ne: excludeId };
    
    const existing = await Appointment.find(query);
    const conflicts = existing.filter(app => 
        startMin < timeToMinutes(app.endTime) && endMin > timeToMinutes(app.startTime)
    );

    return conflicts.length > 0 ? { conflicts } : null;
};

// Metodo POST para crear una nueva cita, con validacion de conflictos y formato de fecha
export const createAppointment = async (req, res) => {
    try {
        const data = req.body;
        const [year, month, day] = data.date.split('-').map(Number);
        data.date = new Date(Date.UTC(year, month - 1, day));

        // LLamamos el metodo para validacion
        const conflictData = await validateConflict(req.body);
        if (conflictData?.error) return res.status(400).json({ message: conflictData.error });
        if (conflictData?.conflicts) return res.status(409).json({ message: 'Existe un conflicto.', conflicts: conflictData.conflicts });

        const newAppointment = await new Appointment(req.body).save();
        // La simulacion para el envio de correos de confirmacion se manejaria aqui, pero por tiempo no se implemento
        res.status(201).json(newAppointment);
    } catch (e) { res.status(500).json({ message: e.message })};
};

// Metodo GET para obtener las citas, con filtros por fecha, doctor y estado, ademas de paginacion
export const getAppointments = async (req, res) => {
    try {
        // Extraemos los filtros y parametros de paginacion de la query
        const { date, doctorName, status, page = 1, limit = 5 } = req.query;
        let query = {};
        
        // Si se pasa una fecha, se busca entre el inicio y fin del dia para esa fecha, agregando la hora para cubrir todo el rango del dia
        if (date) {
            const start = new Date(date + "T00:00:00");
            const end = new Date(date + "T23:59:59");
            query.date = { $gte: start, $lte: end };
        }
        if (doctorName) query.doctorName = { $regex: doctorName, $options: 'i' };
        if (status) query.status = status;

        // Calculamos el numero de documentos a saltar para la paginacion
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const list = await Appointment.find(query)
            .sort({ date: 1, startTime: 1 })
            .skip(skip)
            .limit(parseInt(limit));
            
        const total = await Appointment.countDocuments(query);

        res.json({
            appointments: list,
            total,
            pages: Math.ceil(total / limit),
            currentPage: parseInt(page)
        });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// Metodo PUT para actualizar una cita, con validacion de conflictos y formato de fecha
export const updateAppointment = async (req, res) => {
    try {
        const conflictData = await validateConflict(req.body, req.params.id);
        if (conflictData?.error) return res.status(400).json({ message: conflictData.error });
        if (conflictData?.conflicts) return res.status(409).json({ conflicts: conflictData.conflicts });

        const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// Metodo GET para verificar conflictos de citas, se puede usar para validacion en el frontend antes de enviar la solicitud de creacion o actualizacion
export const checkConflicts = async (req, res) => {
    try {
        const conflictData = await validateConflict(req.query, req.query.excludeId);
        res.json(conflictData?.conflicts || []);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// Metodo GET para obtener una cita por su ID, se puede usar para mostrar detalles de la cita o para cargar datos en un formulario de edicion
export const getAppointmentById = async (req, res) => {
    try {
        const app = await Appointment.findById(req.params.id);
        app ? res.json(app) : res.status(404).json({ message: 'No encontrada' });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// Metodo DELETE para eliminar una cita por su ID, se puede usar para cancelar una cita
export const deleteAppointment = async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Cita eliminada correctamente' });
    } catch (e) { res.status(500).json({ error: e.message }); }
};