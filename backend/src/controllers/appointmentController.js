import Appointment from '../models/Appointment.js';
import { timeToMinutes } from '../utils/timeHelper.js';

const validateConflict = async (data, excludeId = null) => {
    const { doctorName, date, startTime, endTime } = data;
    if (!doctorName || !date || !startTime || !endTime) return { error: 'Faltan campos' };

    const startMin = timeToMinutes(startTime);
    const endMin = timeToMinutes(endTime);

    if (endMin <= startMin) return { error: 'La hora de fin debe ser posterior a la de inicio.' };

    const appDate = new Date(date);
    const today = new Date();
    today.setHours(0,0,0,0);
    if (appDate < today) return { error: 'La fecha no puede ser anterior al día actual.' };

    let query = { doctorName, date: appDate };
    if (excludeId) query._id = { $ne: excludeId };
    
    const existing = await Appointment.find(query);
    const conflicts = existing.filter(app => 
        startMin < timeToMinutes(app.endTime) && endMin > timeToMinutes(app.startTime)
    );

    return conflicts.length > 0 ? { conflicts } : null;
};

export const createAppointment = async (req, res) => {
    try {
        const data = req.body;
        const [year, month, day] = data.date.split('-').map(Number);
        data.date = new Date(Date.UTC(year, month - 1, day));

        const conflictData = await validateConflict(req.body);
        if (conflictData?.error) return res.status(400).json({ message: conflictData.error });
        if (conflictData?.conflicts) return res.status(409).json({ message: 'Existe un conflicto.', conflicts: conflictData.conflicts });

        const newAppointment = await new Appointment(req.body).save();
        console.log("--------------------------------------------------");
        console.log(`Notificacion de Cita Creada`);
        console.log(`Para: ${newAppointment.patientName}`);
        console.log(`Asunto: Confirmación de Cita - Dr. ${newAppointment.doctorName}`);
        console.log(`Mensaje: Hola, tu cita para el día ${newAppointment.date.toLocaleDateString()} a las ${newAppointment.startTime} ha sido programada con éxito.`);
        console.log("--------------------------------------------------");
        res.status(201).json(newAppointment);
    } catch (e) { res.status(500).json({ message: e.message })};
};

export const getAppointments = async (req, res) => {
    try {
        const { date, doctorName, status, page = 1, limit = 5 } = req.query;
        let query = {};
        
        if (date) {
            const start = new Date(date + "T00:00:00");
            const end = new Date(date + "T23:59:59");
            query.date = { $gte: start, $lte: end };
        }
        if (doctorName) query.doctorName = { $regex: doctorName, $options: 'i' };
        if (status) query.status = status;

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

export const updateAppointment = async (req, res) => {
    try {
        const conflictData = await validateConflict(req.body, req.params.id);
        if (conflictData?.error) return res.status(400).json({ message: conflictData.error });
        if (conflictData?.conflicts) return res.status(409).json({ conflicts: conflictData.conflicts });

        const updated = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const checkConflicts = async (req, res) => {
    try {
        const conflictData = await validateConflict(req.query, req.query.excludeId);
        res.json(conflictData?.conflicts || []);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const getAppointmentById = async (req, res) => {
    try {
        const app = await Appointment.findById(req.params.id);
        app ? res.json(app) : res.status(404).json({ message: 'No encontrada' });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

export const deleteAppointment = async (req, res) => {
    try {
        await Appointment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Cita eliminada correctamente' });
    } catch (e) { res.status(500).json({ error: e.message }); }
};