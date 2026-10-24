import * as service from '../services/clinic.service.js';

export function getPatients(_request, response) {
  response.json(service.listPatients());
}

export function createPatient(request, response) {
  response.status(201).json(service.addPatient(request.body));
}

export function getDoctors(_request, response) {
  response.json(service.listDoctors());
}

export function createDoctor(request, response) {
  response.status(201).json(service.addDoctor(request.body));
}

export function getAppointments(_request, response) {
  response.json(service.listAppointments());
}

export function createAppointment(request, response) {
  response.status(201).json(service.addAppointment(request.body));
}
