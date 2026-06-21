import express from 'express';
import { nanoid } from 'nanoid';
import { requireAuth } from '../middleware/auth.js';
import { readDb, writeDb } from '../services/database.js';
import { analyzeSessionNotes } from '../services/sessionAiService.js';

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

  const normalizedEmail = String(appointment.email || '').trim().toLocaleLowerCase('tr-TR');
  const normalizedPhone = String(appointment.phone || '').replace(/\D/g, '');
  const hasRealEmail = normalizedEmail && !normalizedEmail.endsWith('@local.test');
  const hasRealPhone = normalizedPhone && normalizedPhone !== '0000000000';
  const relatedAppointmentIds = (db.appointments || [])
    .filter((item) => {
      const sameEmail = hasRealEmail && String(item.email || '').trim().toLocaleLowerCase('tr-TR') === normalizedEmail;
      const samePhone = hasRealPhone && String(item.phone || '').replace(/\D/g, '') === normalizedPhone;
      return sameEmail || samePhone || item.id === appointment.id;
    })
    .map((item) => item.id);

  const savedNotes = (db.sessions || [])
    .filter((item) => relatedAppointmentIds.includes(item.appointmentId))
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .map((item) => item.anonymousNotes)
    .filter(Boolean);
  const combinedNotes = savedNotes.join('\n---\n');

  if (!savedNotes.length || !combinedNotes.trim() || combinedNotes.replace(/\s+/g, ' ').trim().length < 20) {
    return res.status(400).json({ message: 'AI özeti için bu danışana ait kaydedilmiş yeterli seans notu yok.' });
  }

  const analysis = await analyzeSessionNotes(combinedNotes);
  res.json({
    appointmentId: appointment.id,
    sessionNoteCount: savedNotes.length,
    privacy: 'AI isteğine yalnızca veritabanına kaydedilmiş anonim seans notları gönderilir.',
    analysis
  });
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
