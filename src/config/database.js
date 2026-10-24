import { mkdirSync } from 'node:fs';
import Database from 'better-sqlite3';

const isTest = process.env.NODE_ENV === 'test';

if (!isTest) {
  mkdirSync('data', { recursive: true });
}

const db = new Database(isTest ? ':memory:' : 'data/clinic.db');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS doctors (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    specialization TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS appointments (
    id INTEGER PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    doctor_id INTEGER NOT NULL REFERENCES doctors(id),
    date TEXT NOT NULL
  );
`);

export default db;
