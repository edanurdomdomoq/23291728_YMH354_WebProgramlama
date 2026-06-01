import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { readDb, writeDb } from '../services/database.js';

const router = express.Router();

function createToken(user) {
  // JWT icinde sifre hash'i tutulmaz; sadece rol ve public kimlik bilgileri tasinir.
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role || 'doctor' },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '2h' }
  );
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role || 'doctor', provider: user.provider };
}

router.post('/register', async (req, res) => {
  if (process.env.ALLOW_DOCTOR_REGISTER !== 'true') {
    return res.status(403).json({ message: 'Doktor kaydı kapalı. Giriş sadece veritabanındaki admin hesabı ile yapılır.' });
  }

  const { name, email, password } = req.body;

  // Backend validasyonu zorunludur; frontend atlatilsa bile API hatali veriyi kabul etmez.
  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: 'Ad soyad en az 2 karakter olmalıdır.' });
  }

  if (!/^\S+@\S+\.\S+$/.test(email || '')) {
    return res.status(400).json({ message: 'Gecerli bir e-posta adresi girin.' });
  }

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Şifre en az 6 karakter olmalıdır.' });
  }

  const db = await readDb();
  if (db.users.length > 0 && !String(email || '').toLowerCase().endsWith('@mindcare.test')) {
    return res.status(403).json({ message: 'Klinik güvenliği için herkese açık doktor kaydı kapalı.' });
  }

  const exists = db.users.find((user) => user.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ message: 'Bu e-posta zaten kayitli.' });
  }

  const user = {
    id: nanoid(),
    name: name.trim(),
    email: email.toLowerCase(),
    passwordHash: await bcrypt.hash(password, 10),
    role: 'doctor',
    createdAt: new Date().toISOString()
  };

  db.users.push(user);
  await writeDb(db);

  res.status(201).json({
    token: createToken(user),
    user: publicUser(user)
  });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const db = await readDb();

  if (!db.users.length) {
    return res.status(404).json({ message: 'Veritabanında doktor hesabı yok. Admin kullanıcısını veritabanına ekleyin.' });
  }

  const user = db.users.find((item) => item.email.toLowerCase() === String(email || '').toLowerCase());

  if (!user || !(await bcrypt.compare(password || '', user.passwordHash))) {
    return res.status(401).json({ message: 'E-posta veya sifre hatali.' });
  }

  user.role ||= 'doctor';
  res.json({
    token: createToken(user),
    user: publicUser(user)
  });
});

router.post('/guest', async (req, res) => {
  const { name, email } = req.body;

  if (!name || name.trim().length < 2) {
    return res.status(400).json({ message: 'Ad soyad en az 2 karakter olmalıdır.' });
  }

  if (!/^\S+@\S+\.\S+$/.test(email || '')) {
    return res.status(400).json({ message: 'Gecerli bir e-posta adresi girin.' });
  }

  const db = await readDb();
  db.guestUsers ||= [];

  let guest = db.guestUsers.find((item) => item.email.toLowerCase() === email.toLowerCase());
  if (!guest) {
    guest = {
      id: nanoid(),
      name: name.trim(),
      email: email.toLowerCase(),
      provider: 'guest',
      role: 'guest',
      createdAt: new Date().toISOString()
    };
    db.guestUsers.push(guest);
    await writeDb(db);
  }

  res.status(201).json({
    token: createToken(guest),
    user: publicUser(guest)
  });
});

export default router;
