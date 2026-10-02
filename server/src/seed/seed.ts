/* eslint-disable no-console */
import mongoose, { type InsertManyOptions } from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { env } from '../config/env';
import { Doctor } from '../models/Doctor';
import {
  Patient,
  PATIENT_GENDERS,
  PATIENT_STATUSES,
  type PatientGender,
  type PatientStatus,
} from '../models/Patient';
import { User } from '../models/User';

/* --------------------------- sample data pools --------------------------- */
const FIRST_NAMES = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda',
  'David', 'Elizabeth', 'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica',
  'Thomas', 'Sarah', 'Charles', 'Karen', 'Daniel', 'Nancy', 'Matthew', 'Lisa',
  'Anthony', 'Margaret', 'Mark', 'Sandra', 'Ayesha', 'Omar', 'Priya', 'Chen',
];
const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Khan', 'Patel', 'Nguyen', 'Chowdhury',
];
const SPECIALIZATIONS = [
  'Cardiology', 'Neurology', 'Pediatrics', 'Orthopedics', 'Dermatology',
  'Oncology', 'Psychiatry', 'Radiology', 'General Surgery', 'Endocrinology',
];
const HOSPITALS = [
  'City General Hospital', 'St. Mary Medical Center', 'Riverside Health',
  'Green Valley Clinic', 'Sunrise Hospital', 'Lakeside Medical',
  'Metro Care Institute', 'Harmony Health Center',
];
const CONDITIONS = [
  'Hypertension', 'Diabetes Type II', 'Asthma', 'Migraine', 'Arthritis',
  'Anxiety Disorder', 'Fractured Limb', 'Skin Allergy', 'Thyroid Disorder',
  'Chronic Back Pain', 'Pneumonia', 'Cardiac Arrhythmia',
];

/* ------------------------------- helpers -------------------------------- */
const pick = <T>(arr: readonly T[]): T => arr[Math.floor(Math.random() * arr.length)]!;
const randInt = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/** Random date within the last `months` months, for realistic timelines. */
function randomRecentDate(months = 6): Date {
  const now = Date.now();
  const past = now - months * 30 * 24 * 60 * 60 * 1000;
  return new Date(past + Math.random() * (now - past));
}

function phone(): string {
  return `+1-${randInt(200, 989)}-${randInt(100, 999)}-${randInt(1000, 9999)}`;
}

/* -------------------------------- seed ---------------------------------- */
async function seed(): Promise<void> {
  await connectDB();
  console.log('🌱 Seeding database...');

  // Reset collections (idempotent re-seed).
  await Promise.all([Doctor.deleteMany({}), Patient.deleteMany({}), User.deleteMany({})]);

  // 1) Admin user — created via the model so the password gets hashed.
  await User.create({
    name: env.ADMIN_NAME,
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
    role: 'admin',
  });
  console.log(`👤 Admin created: ${env.ADMIN_EMAIL}`);

  // 2) Doctors
  const DOCTOR_COUNT = 24;
  const doctorDocs = Array.from({ length: DOCTOR_COUNT }).map((_, i) => {
    const first = pick(FIRST_NAMES);
    const last = pick(LAST_NAMES);
    const created = randomRecentDate(6);
    return {
      name: `Dr. ${first} ${last}`,
      specialization: pick(SPECIALIZATIONS),
      hospital: pick(HOSPITALS),
      phone: phone(),
      email: `${first}.${last}.${i}@hospital.example.com`.toLowerCase(),
      createdAt: created,
      updatedAt: created,
    };
  });
  // timestamps:false so our custom createdAt values are preserved.
  const doctors = await Doctor.insertMany(doctorDocs, {
    timestamps: false,
  } as InsertManyOptions);
  console.log(`🩺 Inserted ${doctors.length} doctors`);

  // 3) Patients — distributed across doctors with varied dates.
  const patientDocs: Record<string, unknown>[] = [];
  for (const doctor of doctors) {
    const count = randInt(3, 16);
    for (let i = 0; i < count; i += 1) {
      const first = pick(FIRST_NAMES);
      const last = pick(LAST_NAMES);
      const created = randomRecentDate(6);
      patientDocs.push({
        name: `${first} ${last}`,
        age: randInt(1, 92),
        gender: pick(PATIENT_GENDERS) as PatientGender,
        condition: pick(CONDITIONS),
        status: pick(PATIENT_STATUSES) as PatientStatus,
        phone: phone(),
        email: `${first}.${last}.${patientDocs.length}@patient.example.com`.toLowerCase(),
        doctor: doctor._id,
        createdAt: created,
        updatedAt: created,
      });
    }
  }
  const patients = await Patient.insertMany(patientDocs, {
    timestamps: false,
  } as InsertManyOptions);
  console.log(`🧑‍🤝‍🧑 Inserted ${patients.length} patients`);

  // 4) Ensure indexes (incl. text indexes) exist.
  await Promise.all([Doctor.syncIndexes(), Patient.syncIndexes(), User.syncIndexes()]);
  console.log('📇 Indexes synced');

  console.log('\n✅ Seed complete!');
  console.log('   Login with:');
  console.log(`   • Email:    ${env.ADMIN_EMAIL}`);
  console.log(`   • Password: ${env.ADMIN_PASSWORD}`);
}

seed()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectDB();
    await mongoose.connection.close();
  });
