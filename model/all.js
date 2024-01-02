const Mongoose = require("mongoose");
const { Schema } = mongoose;

const doctorSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    first_name: String,
    last_name: String,
    specialization: String,
    contact_number: String,
    address: String,
});

  // Patient Schema
const patientSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    first_name: String,
    last_name: String,
    date_of_birth: Date,
    gender: String,
    contact_number: String,
    address: String,
});

// Appointment Schema
const appointmentSchema = new Schema({
    patient_id: { type: Schema.Types.ObjectId, ref: 'Patient' },
    doctor_id: { type: Schema.Types.ObjectId, ref: 'Doctor' },
    appointment_date_time: Date,
    status: String, // "Pending", "Confirmed", "Completed", etc.
});

// Medical History Schema
const medicalHistorySchema = new Schema({
patient_id: { type: Schema.Types.ObjectId, ref: 'Patient' },
doctor_id: { type: Schema.Types.ObjectId, ref: 'Doctor' },
date: Date,
diagnosis: String,
prescription: String,
notes: String,
});

// Admin Schema
const adminSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    first_name: String,
    last_name: String,
    contact_number: String,
    address: String,
});

// Create models
const Doctor = mongoose.model('Doctor', doctorSchema);
const Patient = mongoose.model('Patient', patientSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const MedicalHistory = mongoose.model('MedicalHistory', medicalHistorySchema);
const Admin = mongoose.model('Admin', adminSchema);

module.exports = { Patient, Doctor, Appointment, MedicalHistory, Admin };
