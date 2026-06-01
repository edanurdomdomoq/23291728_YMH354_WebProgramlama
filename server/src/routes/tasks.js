import express from 'express';
import { nanoid } from 'nanoid';
import { requireAuth } from '../middleware/auth.js';
import { readDb, writeDb } from '../services/database.js';

const router = express.Router();

// Bu dosyadaki tüm endpointler kullanıcı girişi ister.
router.use(requireAuth);

router.get('/', async (req, res) => {
  const db = await readDb();
  // Her kullanıcı sadece kendi danışan takip kayıtlarını görür.
  res.json(db.tasks.filter((task) => task.userId === req.user.id));
});

router.post('/', async (req, res) => {
  const { title, category, priority, dueDate, estimatedHours } = req.body;

  if (!title || title.trim().length < 3) {
    return res.status(400).json({ message: 'Record title must be at least 3 characters' });
  }

  const task = {
    id: nanoid(),
    // userId iliskisi dashboard hesaplamalarinda ve veri izolasyonunda kullanilir.
    userId: req.user.id,
    title: title.trim(),
    category: category || 'Duygu Gunlugu',
    priority: priority || 'medium',
    dueDate: dueDate || null,
    estimatedHours: Number(estimatedHours || 1),
    completed: false,
    createdAt: new Date().toISOString()
  };

  const db = await readDb();
  db.tasks.push(task);
  await writeDb(db);
  res.status(201).json(task);
});

router.patch('/:id', async (req, res) => {
  const db = await readDb();
  // id ve userId birlikte kontrol edilir; başka kullanıcının kaydı güncellenemez.
  const task = db.tasks.find((item) => item.id === req.params.id && item.userId === req.user.id);

  if (!task) {
    return res.status(404).json({ message: 'Record not found' });
  }

  Object.assign(task, {
    title: req.body.title ?? task.title,
    category: req.body.category ?? task.category,
    priority: req.body.priority ?? task.priority,
    dueDate: req.body.dueDate ?? task.dueDate,
    estimatedHours: req.body.estimatedHours ? Number(req.body.estimatedHours) : task.estimatedHours,
    completed: typeof req.body.completed === 'boolean' ? req.body.completed : task.completed
  });

  await writeDb(db);
  res.json(task);
});

router.delete('/:id', async (req, res) => {
  const db = await readDb();
  const before = db.tasks.length;
  db.tasks = db.tasks.filter((item) => !(item.id === req.params.id && item.userId === req.user.id));

  if (db.tasks.length === before) {
    return res.status(404).json({ message: 'Record not found' });
  }

  await writeDb(db);
  res.status(204).end();
});

export default router;
