import express from 'express';
import { nanoid } from 'nanoid';
import { requireAuth } from '../middleware/auth.js';
import { readDb, writeDb } from '../services/database.js';
import { listMailLog } from '../services/emailService.js';

const router = express.Router();
router.use(requireAuth);

function slugify(text) {
  return String(text || '')
    .trim()
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

router.get('/posts', async (req, res) => {
  const db = await readDb();
  res.json(db.posts || []);
});

router.post('/posts', async (req, res) => {
  const { title, excerpt, image, date, published = true } = req.body;
  if (!title || title.trim().length < 3) return res.status(400).json({ message: 'Blog başlığı en az 3 karakter olmalıdır.' });

  const db = await readDb();
  const post = {
    id: nanoid(),
    title: title.trim(),
    date: date || new Date().toLocaleDateString('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }),
    excerpt: excerpt || '',
    image: image || 'https://images.unsplash.com/photo-1573497491208-6b1acb260507?auto=format&fit=crop&w=900&q=80',
    published,
    createdAt: new Date().toISOString()
  };

  db.posts ||= [];
  db.posts.push(post);
  await writeDb(db);
  res.status(201).json(post);
});

router.patch('/posts/:id', async (req, res) => {
  const db = await readDb();
  const post = (db.posts || []).find((item) => item.id === req.params.id);
  if (!post) return res.status(404).json({ message: 'Blog yazısı bulunamadı.' });

  Object.assign(post, {
    title: req.body.title ?? post.title,
    excerpt: req.body.excerpt ?? post.excerpt,
    image: req.body.image ?? post.image,
    date: req.body.date ?? post.date,
    published: req.body.published ?? post.published,
    updatedAt: new Date().toISOString()
  });

  await writeDb(db);
  res.json(post);
});

router.delete('/posts/:id', async (req, res) => {
  const db = await readDb();
  db.posts = (db.posts || []).filter((item) => item.id !== req.params.id);
  await writeDb(db);
  res.status(204).send();
});

router.get('/services', async (req, res) => {
  const db = await readDb();
  res.json(db.services || []);
});

router.post('/services', async (req, res) => {
  const { title, summary, icon = 'Heart', published = true } = req.body;
  if (!title || title.trim().length < 3) return res.status(400).json({ message: 'Hizmet başlığı en az 3 karakter olmalıdır.' });

  const db = await readDb();
  db.services ||= [];
  const baseId = slugify(title) || nanoid();
  const service = {
    id: db.services.some((item) => item.id === baseId) ? `${baseId}-${nanoid(4)}` : baseId,
    title: title.trim(),
    summary: summary || '',
    icon,
    published
  };

  db.services.push(service);
  await writeDb(db);
  res.status(201).json(service);
});

router.patch('/services/:id', async (req, res) => {
  const db = await readDb();
  const service = (db.services || []).find((item) => item.id === req.params.id);
  if (!service) return res.status(404).json({ message: 'Hizmet bulunamadı.' });

  Object.assign(service, {
    title: req.body.title ?? service.title,
    summary: req.body.summary ?? service.summary,
    icon: req.body.icon ?? service.icon,
    published: req.body.published ?? service.published
  });

  await writeDb(db);
  res.json(service);
});

router.delete('/services/:id', async (req, res) => {
  const db = await readDb();
  db.services = (db.services || []).filter((item) => item.id !== req.params.id);
  await writeDb(db);
  res.status(204).send();
});

router.get('/reviews', async (req, res) => {
  const db = await readDb();
  res.json(db.reviews || []);
});

router.get('/tables', async (req, res) => {
  const db = await readDb();
  res.json({
    admins: db.users || [],
    appointments: db.appointments || [],
    reviews: db.reviews || [],
    services: db.services || [],
    posts: db.posts || [],
    messages: db.messages || []
  });
});

router.get('/mail-log', async (req, res) => {
  const log = await listMailLog();
  res.json(log.slice().reverse());
});

export default router;
