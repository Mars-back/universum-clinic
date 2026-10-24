import db from '../config/database.js';

export function findPatients() {
  return db.prepare('SELECT id, name, phone FROM patients ORDER BY id DESC').all();
}

export function insertPatient(name, phone) {
  const result = db.prepare('INSERT INTO patients (name, phone) VALUES (?, ?)').run(name, phone);
  return { id: Number(result.lastInsertRowid), name, phone };
}

export function findDoctors() {
  return db.prepare('SELECT id, name, specialization FROM doctors ORDER BY id DESC').all();
}

export function insertDoctor(name, specialization) {
  const result = db
    .prepare('INSERT INTO doctors (name, specialization) VALUES (?, ?)')
    .run(name, specialization);
  return { id: Number(result.lastInsertRowid), name, specialization };
}

export function findAppointments() {
  return db
    .prepare(
      `
    SELECT id, patient_id AS patientId, doctor_id AS doctorId, date
    FROM appointments ORDER BY id DESC
  `,
    )
    .all();
}

export function insertAppointment(patientId, doctorId, date) {
  const result = db
    .prepare('INSERT INTO appointments (patient_id, doctor_id, date) VALUES (?, ?, ?)')
    .run(patientId, doctorId, date);
  return { id: Number(result.lastInsertRowid), patientId, doctorId, date };
}
