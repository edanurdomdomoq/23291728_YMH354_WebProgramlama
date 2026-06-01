import express from 'express';
import { nanoid } from 'nanoid';
import { requireAuth } from '../middleware/auth.js';
import { readDb, writeDb } from '../services/database.js';
import { generateStudyPlan } from '../services/aiService.js';

const router = express.Router();

router.post('/study-plan', requireAuth, async (req, res) => {
  const { goal, level, weeklyHours } = req.body;

  // AI endpointi de validasyon yapar; boş veya çok kısa hedef kabul edilmez.
  if (!goal || goal.trim().length < 5) {
    return res.status(400).json({ message: 'Goal must be at least 5 characters' });
  }

  if (!['beginner', 'intermediate', 'advanced'].includes(level)) {
    return res.status(400).json({ message: 'Level must be beginner, intermediate or advanced' });
  }

  // AI üretimi servis katmanına ayrıldı.
  // Böylece route sadece HTTP request/response işinden sorumlu kalır.
  const plan = await generateStudyPlan({ goal: goal.trim(), level, weeklyHours });
  const db = await readDb();
  const record = {
    id: nanoid(),
    userId: req.user.id,
    goal: goal.trim(),
    level,
    weeklyHours: Number(weeklyHours || 6),
    plan,
    createdAt: new Date().toISOString()
  };

  db.aiPlans.push(record);
  await writeDb(db);
  res.status(201).json(record);
});

export default router;
