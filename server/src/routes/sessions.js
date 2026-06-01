import express from 'express';
import { nanoid } from 'nanoid';
import { requireAuth } from '../middleware/auth.js';
import { readDb, writeDb } from '../services/database.js';
import { generateStudyPlan } from '../services/aiService.js';

const router = express.Router();

router.use(requireAuth);

function localDateKey(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

router.get('/today', async (req, res) => {
  const today = localDateKey();
  const db = await readDb();
  const items = (db.appointments || []).filter((item) => item.status === 'approved' && item.preferredDate === today);
  res.json(items);
});

router.post('/summary/:appointmentId', async (req, res) => {
  const db = await readDb();
  const appointment = db.appointments.find((item) => item.id === req.params.appointmentId);
  if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

  const history = (db.sessions || [])
    .filter((item) => item.appointmentId === appointment.id)
    .map((item, index) => `Hafta ${index + 1}: ${item.anonymousNotes}`)
    .join('\n');

  const prompt = [
    'Danışan bilgilerini anonim tutarak KVKK uyumlu seans özeti hazırla. Kişi adı, telefon ve e-posta kullanma.',
    `Konu: ${appointment.service}`,
    `Başvuru notu: ${appointment.message}`,
    `Geçmiş anonim notlar: ${history || 'Geçmiş not yok.'}`
  ].join('\n');

  const plan = await generateStudyPlan({ goal: prompt, level: 'intermediate', weeklyHours: 2 });
  res.json({ appointmentId: appointment.id, codeName: appointment.codeName, summary: plan });
});

router.post('/:appointmentId', async (req, res) => {
  const db = await readDb();
  const appointment = db.appointments.find((item) => item.id === req.params.appointmentId);
  if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

  const session = {
    id: nanoid(),
    appointmentId: appointment.id,
    codeName: appointment.codeName,
    anonymousNotes: req.body.anonymousNotes || '',
    createdAt: new Date().toISOString()
  };
  db.sessions.push(session);
  await writeDb(db);
  res.status(201).json(session);
});

export default router;
