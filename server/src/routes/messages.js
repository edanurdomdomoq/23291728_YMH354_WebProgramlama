import express from 'express';
import { nanoid } from 'nanoid';
import { requireAuth } from '../middleware/auth.js';
import { readDb, writeDb } from '../services/database.js';

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  const db = await readDb();
  const messages = db.messages || [];

  if (req.user.role === 'guest') {
    return res.json(messages.filter((item) => item.guestId === req.user.id).slice().reverse());
  }

  res.json(messages.slice().reverse());
});

router.post('/', async (req, res) => {
  const { subject, body } = req.body;

  if (!subject || subject.trim().length < 3) {
    return res.status(400).json({ message: 'Konu en az 3 karakter olmalıdır.' });
  }

  if (!body || body.trim().length < 10) {
    return res.status(400).json({ message: 'Mesaj en az 10 karakter olmalıdır.' });
  }

  const db = await readDb();
  db.messages ||= [];

  const message = {
    id: nanoid(),
    guestId: req.user.id,
    guestName: req.user.name || 'Misafir',
    guestEmail: req.user.email || '-',
    subject: subject.trim(),
    body: body.trim(),
    status: 'unread',
    createdAt: new Date().toISOString()
  };

  db.messages.push(message);
  await writeDb(db);

  res.status(201).json(message);
});

router.patch('/:id', async (req, res) => {
  if (req.user.role === 'guest') {
    return res.status(403).json({ message: 'Bu işlem sadece klinik panelinden yapılabilir.' });
  }

  const db = await readDb();
  const message = (db.messages || []).find((item) => item.id === req.params.id);
  if (!message) return res.status(404).json({ message: 'Mesaj bulunamadı.' });

  if (req.body.reply && String(req.body.reply).trim().length < 3) {
    return res.status(400).json({ message: 'Cevap en az 3 karakter olmalıdır.' });
  }

  if (req.body.reply) {
    message.reply = String(req.body.reply).trim();
    message.repliedAt = new Date().toISOString();
    message.status = 'replied';
  } else {
    message.status = req.body.status || 'read';
    if (message.status === 'read') message.readAt = new Date().toISOString();
  }
  message.updatedAt = new Date().toISOString();
  await writeDb(db);

  res.json(message);
});

export default router;
