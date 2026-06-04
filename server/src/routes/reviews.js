import express from 'express';
import { nanoid } from 'nanoid';
import { readDb, writeDb } from '../services/database.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { appointmentId, text } = req.body;
  if (!text || text.trim().length < 10) return res.status(400).json({ message: 'Review text is too short' });

  const db = await readDb();
  const review = {
    id: nanoid(),
    appointmentId,
    text: text.trim().replace(/\s+/g, ' '),
    ai: { provider: 'disabled', stars: 5, summary: 'Yapay zeka analizi pasif.' },
    published: true,
    createdAt: new Date().toISOString()
  };
  db.reviews.push(review);
  await writeDb(db);
  res.status(201).json(review);
});

export default router;
