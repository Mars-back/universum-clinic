import * as repository from '../repositories/clinic.repository.js';

function invalid(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

function text(value, field) {
  if (typeof value !== 'string' || !value.trim()) {
    throw invalid(`Поле «${field}» має бути непорожнім текстом.`);
  }
  return value.trim();
}

export function listPatients() {
  return repository.findPatients();
}

export function addPatient(data) {
  return repository.insertPatient(text(data?.name, 'ПІБ'), text(data?.phone, 'Телефон'));
}

export function listDoctors() {
  return repository.findDoctors();
}

export function addDoctor(data) {
  return repository.insertDoctor(
    text(data?.name, 'ПІБ'),
    text(data?.specialization, 'Спеціалізація'),
  );
}

export function listAppointments() {
  return repository.findAppointments();
}

export function addAppointment(data) {
  const patientId = data?.patientId;
  const doctorId = data?.doctorId;
  const date = text(data?.date, 'Дата');

  if (
    !Number.isSafeInteger(patientId) ||
    patientId < 1 ||
    !Number.isSafeInteger(doctorId) ||
    doctorId < 1
  ) {
    throw invalid('patientId і doctorId мають бути додатними цілими числами.');
  }

  const parsed = new Date(date);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(parsed.getTime()) ||
    parsed.toISOString().slice(0, 10) !== date
  ) {
    throw invalid('Дата має існувати та мати формат YYYY-MM-DD.');
  }

  try {
    return repository.insertAppointment(patientId, doctorId, date);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_FOREIGNKEY') {
      throw invalid('Пацієнта або лікаря з таким id немає.');
    }
    throw error;
  }
}
