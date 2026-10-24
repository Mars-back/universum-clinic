import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { once } from 'node:events';
import { after, before, beforeEach, test } from 'node:test';

process.env.NODE_ENV = 'test';
const { default: app } = await import('../src/app.js');
const { default: db } = await import('../src/config/database.js');
let server;
let address;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  address = `http://127.0.0.1:${server.address().port}`;
});

beforeEach(() => {
  db.exec('DELETE FROM appointments; DELETE FROM doctors; DELETE FROM patients;');
});

after(async () => {
  await new Promise((resolve) => server.close(resolve));
  db.close();
});

function get(path) {
  return fetch(address + path, { signal: AbortSignal.timeout(3000) });
}

function post(path, body) {
  return fetch(address + '/api' + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(3000),
  });
}

async function addPeople() {
  const patient = await post('/patients', { name: 'Пацієнт', phone: '0501234567' });
  assert.equal(patient.status, 201);
  await patient.json();
  const doctor = await post('/doctors', { name: 'Лікар', specialization: 'Терапевт' });
  assert.equal(doctor.status, 201);
  await doctor.json();
}

test('Пацієнт, лікар і прийом зберігаються та читаються з SQLite', async () => {
  const patient = { id: 1, name: 'Тестовий пацієнт', phone: '+380501234567' };
  const doctor = { id: 1, name: 'Тестовий лікар', specialization: 'Терапевт' };
  const appointment = { id: 1, patientId: 1, doctorId: 1, date: '2026-11-01' };

  for (const [path, body, expected] of [
    ['/patients', { name: '  Тестовий пацієнт  ', phone: ' +380501234567 ' }, patient],
    ['/doctors', { name: ' Тестовий лікар ', specialization: ' Терапевт ' }, doctor],
    ['/appointments', { patientId: 1, doctorId: 1, date: '2026-11-01' }, appointment],
  ]) {
    const response = await post(path, body);
    assert.equal(response.status, 201);
    assert.deepEqual(await response.json(), expected);
  }

  for (const [path, expected] of [
    ['/patients', patient],
    ['/doctors', doctor],
    ['/appointments', appointment],
  ]) {
    const response = await get('/api' + path);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), [expected]);
  }
});

test('Неправильні текстові поля не створюють записів', async () => {
  for (const [path, body] of [
    ['/patients', { name: '  ', phone: '0501234567' }],
    ['/patients', { name: 'Пацієнт', phone: 501234567 }],
    ['/doctors', { name: null, specialization: 'Терапевт' }],
    ['/doctors', { name: 'Лікар', specialization: '  ' }],
  ]) {
    const response = await post(path, body);
    assert.equal(response.status, 400);
    assert.equal(typeof (await response.json()).error, 'string');
  }
  assert.equal(db.prepare('SELECT COUNT(*) AS total FROM patients').get().total, 0);
  assert.equal(db.prepare('SELECT COUNT(*) AS total FROM doctors').get().total, 0);
});

test('Прийом не можна прив’язати до відсутнього пацієнта або лікаря', async () => {
  await addPeople();
  for (const ids of [
    { patientId: 999, doctorId: 1 },
    { patientId: 1, doctorId: 999 },
  ]) {
    const response = await post('/appointments', { ...ids, date: '2026-11-01' });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: 'Пацієнта або лікаря з таким id немає.' });
  }
  assert.equal(db.prepare('SELECT COUNT(*) AS total FROM appointments').get().total, 0);
});

test('Неправильні дата та ідентифікатори відхиляються', async () => {
  await addPeople();
  for (const invalid of [
    { date: '2026-02-31' },
    { date: '2026-13-01' },
    { date: '01.11.2026' },
    { patientId: 0 },
    { patientId: '1' },
    { doctorId: 1.5 },
    { doctorId: Number.MAX_SAFE_INTEGER + 1 },
  ]) {
    const response = await post('/appointments', {
      patientId: 1,
      doctorId: 1,
      date: '2026-11-01',
      ...invalid,
    });
    assert.equal(response.status, 400);
    await response.json();
  }
  assert.equal(db.prepare('SELECT COUNT(*) AS total FROM appointments').get().total, 0);
});

test('У базі рівно три таблиці', () => {
  const tables = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
    .all();
  assert.deepEqual(tables, [{ name: 'appointments' }, { name: 'doctors' }, { name: 'patients' }]);
});

test('Health, version, невідома адреса та пошкоджений JSON', async () => {
  const health = await get('/health');
  assert.equal(health.status, 200);
  assert.deepEqual(await health.json(), { status: 'ok' });

  const version = await get('/version');
  assert.equal(version.status, 200);
  const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  assert.deepEqual(await version.json(), { sha });

  const missing = await get('/missing');
  assert.equal(missing.status, 404);
  assert.deepEqual(await missing.json(), { error: 'Маршрут не знайдено.' });

  const malformed = await fetch(address + '/api/patients', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{',
    signal: AbortSignal.timeout(3000),
  });
  assert.equal(malformed.status, 400);
  assert.equal(typeof (await malformed.json()).error, 'string');
  assert.equal(db.prepare('SELECT COUNT(*) AS total FROM patients').get().total, 0);
});
