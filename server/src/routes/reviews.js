import express from 'express';
import { nanoid } from 'nanoid';
import { readDb, writeDb } from '../services/database.js';
import { analyzeReview } from '../services/reviewService.js';

const router = express.Router();

router.post('/', async (req, res) => {
  const { appointmentId, text } = req.body;
  if (!text || text.trim().length < 10) return res.status(400).json({ message: 'Review text is too short' });

  const db = await readDb();
  const ai = await analyzeReview(text);
  const review = {
    id: nanoid(),
    appointmentId,
    text: ai.cleanedText || text.trim().replace(/\s+/g, ' '),
    ai,
    published: true,
    createdAt: new Date().toISOString()
  };
  db.reviews.push(review);
  await writeDb(db);
  res.status(201).json(review);
});

export default router;
