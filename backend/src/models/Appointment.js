import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  // El id es generado por Mongoose automaticamente
  patientName: { type: String, required: true },
  doctorName: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  reason: { type: String, required: true },
  status: {
    type: String,
    enum: ["scheduled", "completed", "cancelled"],
    default: "scheduled",
  },
}, { timestamps: true });

export default mongoose.model("Appointment", appointmentSchema);
