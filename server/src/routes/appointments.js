import express from 'express';
import { nanoid } from 'nanoid';
import { requireAuth } from '../middleware/auth.js';
import { readAppointments, readDb, writeDb } from '../services/database.js';
import { sendMail } from '../services/emailService.js';

const router = express.Router();

const workingHours = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

function todayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isPastDate(date) {
  return Boolean(date) && date < todayKey();
}

function normalizeName(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('tr-TR');
}

function normalizeEmail(value) {
  return String(value || '').trim().toLocaleLowerCase('tr-TR');
}

function slotIsAvailable(db, preferredDate, preferredTime, ignoredId = null) {
  if (!preferredDate || !preferredTime) return true;
  return !(db.appointments || []).some((item) => (
    item.id !== ignoredId
    && item.preferredDate === preferredDate
    && item.preferredTime === preferredTime
    && ['pending', 'approved', 'completed'].includes(item.status)
  ));
}

function approvedSlotIsFree(db, preferredDate, preferredTime, ignoredId = null) {
  if (!preferredDate || !preferredTime) return true;
  return !(db.appointments || []).some((item) => (
    item.id !== ignoredId
    && item.preferredDate === preferredDate
    && item.preferredTime === preferredTime
    && ['approved', 'completed'].includes(item.status)
  ));
}

function sameApplicantExists(db, name, email) {
  const normalizedName = normalizeName(name);
  const normalizedEmail = normalizeEmail(email);
  return (db.appointments || []).some((item) => (
    normalizeName(item.name) === normalizedName
    && normalizeEmail(item.email) === normalizedEmail
    && item.status !== 'rejected'
  ));
}

function emailPersonLimitReached(db, name, email) {
  const normalizedEmail = normalizeEmail(email);
  const normalizedName = normalizeName(name);
  const people = new Set((db.appointments || [])
    .filter((item) => normalizeEmail(item.email) === normalizedEmail && item.status !== 'rejected')
    .map((item) => normalizeName(item.name))
    .filter(Boolean));

  return !people.has(normalizedName) && people.size >= 3;
}

router.post('/', async (req, res) => {
  const { name, email, phone, service, message, preferredDate, preferredTime } = req.body;

  if (!name || name.trim().length < 2) return res.status(400).json({ message: 'Ad soyad zorunludur.' });
  if (!/^\S+@\S+\.\S+$/.test(email || '')) return res.status(400).json({ message: 'Geçerli bir e-posta girilmelidir.' });
  if (!phone || phone.trim().length < 10) return res.status(400).json({ message: 'Telefon zorunludur.' });
  if (!preferredDate) return res.status(400).json({ message: 'Randevu tarihi seçilmelidir.' });
  if (isPastDate(preferredDate)) return res.status(400).json({ message: 'Geçmiş tarihe başvuru yapılamaz.' });
  if (!preferredTime || !workingHours.includes(preferredTime)) return res.status(400).json({ message: 'Boş bir randevu saati seçilmelidir.' });

  const db = await readDb();
  if (sameApplicantExists(db, name, email)) {
    return res.status(409).json({ message: 'Bu ad soyad ve e-posta ile daha önce başvuru yapılmış.' });
  }
  if (emailPersonLimitReached(db, name, email)) {
    return res.status(409).json({ message: 'Aynı e-posta ile en fazla 3 farklı kişi için randevu alınabilir.' });
  }
  if (!slotIsAvailable(db, preferredDate, preferredTime)) {
    return res.status(409).json({ message: 'Bu saat dolu. Lütfen başka bir saat seçin.' });
  }

  const appointment = {
    id: nanoid(),
    codeName: name.trim(),
    name: name.trim(),
    email: normalizeEmail(email),
    phone: phone.trim(),
    service: service || 'Online Terapi',
    message: message || '',
    preferredDate: preferredDate || null,
    preferredTime: preferredTime || null,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  db.appointments.push(appointment);
  await writeDb(db);
  res.status(201).json(appointment);
});

router.get('/slots', async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ message: 'Tarih zorunludur.' });
  if (isPastDate(date)) return res.json({ date, slots: workingHours.map((time) => ({ time, available: false, appointment: null })) });

  const appointments = (await readAppointments()).filter((item) => item.preferredDate === date && ['pending', 'approved', 'completed'].includes(item.status));
  const slots = workingHours.map((time) => {
    const appointment = appointments.find((item) => item.preferredTime === time);
    return {
      time,
      available: !appointment,
      appointment: appointment ? {
        id: appointment.id,
        codeName: appointment.codeName,
        service: appointment.service,
        status: appointment.status
      } : null
    };
  });
  res.json({ date, slots });
});

router.get('/', requireAuth, async (req, res) => {
  const visibleAppointments = (await readAppointments()).filter((item) => item.status !== 'rejected');
  res.json(visibleAppointments.slice().reverse());
});

router.post('/doctor-create', requireAuth, async (req, res) => {
  const { name, service, preferredDate, preferredTime, message } = req.body;
  if (!name || name.trim().length < 2) return res.status(400).json({ message: 'Danışan adı soyadı zorunludur.' });
  if (!preferredDate || isPastDate(preferredDate)) return res.status(400).json({ message: 'Geçmiş tarihe seans oluşturulamaz.' });
  if (!preferredTime || !workingHours.includes(preferredTime)) return res.status(400).json({ message: 'Geçerli bir saat seçilmelidir.' });

  const db = await readDb();
  if (!slotIsAvailable(db, preferredDate, preferredTime)) {
    return res.status(409).json({ message: 'Bu saat dolu. Lütfen başka bir saat seçin.' });
  }

  const patientName = name.trim();
  const appointment = {
    id: nanoid(),
    codeName: patientName,
    name: patientName,
    email: `manuel-${Date.now()}@local.test`,
    phone: '0000000000',
    service: service || 'Online Terapi',
    message: message || 'Takvimden manuel oluşturulan seans',
    preferredDate,
    preferredTime,
    status: 'approved',
    createdAt: new Date().toISOString()
  };

  db.appointments.push(appointment);
  await writeDb(db);
  res.status(201).json(appointment);
});

router.patch('/:id', requireAuth, async (req, res) => {
  const db = await readDb();
  const appointment = db.appointments.find((item) => item.id === req.params.id);

  if (!appointment) return res.status(404).json({ message: 'Başvuru bulunamadı.' });

  const previousStatus = appointment.status;
  appointment.status = req.body.status ?? appointment.status;
  appointment.service = req.body.service ?? appointment.service;
  const nextDate = req.body.preferredDate ?? appointment.preferredDate;
  const nextTime = req.body.preferredTime ?? appointment.preferredTime;

  if (nextDate && isPastDate(nextDate) && appointment.status === 'approved') {
    return res.status(400).json({ message: 'Geçmiş tarihli başvuru onaylanamaz. Lütfen takvimden yeni bir boş saat oluşturun.' });
  }
  if (nextTime && !workingHours.includes(nextTime)) return res.status(400).json({ message: 'Geçerli bir saat seçilmelidir.' });
  if (appointment.status === 'approved' && !approvedSlotIsFree(db, nextDate, nextTime, appointment.id)) {
    return res.status(409).json({ message: 'Bu saatte onaylanmış başka seans var. Lütfen başka bir saat seçin.' });
  }

  appointment.preferredDate = nextDate;
  appointment.preferredTime = nextTime;

  if (appointment.status !== previousStatus) {
    await writeDb(db);
    if (appointment.status === 'approved') {
      appointment.mailDelivery = await sendMail({
        to: appointment.email,
        type: 'appointment-approved',
        subject: 'Randevunuz onaylandı',
        message: `${appointment.preferredDate || ''} ${appointment.preferredTime || ''} tarihli ${appointment.service} randevunuz onaylandı.`
      });
    }
    if (appointment.status === 'rejected') {
      appointment.mailDelivery = await sendMail({
        to: appointment.email,
        type: 'appointment-rejected',
        subject: 'Randevu başvurunuz hakkında',
        message: 'Randevu başvurunuz uygunluk nedeniyle onaylanamadı. Yeni bir zaman için tekrar başvuru yapabilirsiniz.'
      });
    }
    if (appointment.status === 'completed') {
      const reviewUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/review?appointment=${appointment.id}`;
      appointment.mailDelivery = await sendMail({
        to: appointment.email,
        type: 'session-completed',
        subject: 'Seansınız için teşekkür ederiz',
        message: `Görüşmeniz tamamlandı. Deneyiminizi paylaşmak için: ${reviewUrl}`
      });
    }
    await writeDb(db);
    return res.json(appointment);
  }

  await writeDb(db);
  res.json(appointment);
});

router.delete('/:id', requireAuth, async (req, res) => {
  const db = await readDb();
  const before = (db.appointments || []).length;
  db.appointments = (db.appointments || []).filter((item) => item.id !== req.params.id);
  db.sessions = (db.sessions || []).filter((item) => item.appointmentId !== req.params.id);
  db.reviews = (db.reviews || []).filter((item) => item.appointmentId !== req.params.id);

  if (db.appointments.length === before) {
    return res.status(404).json({ message: 'Silinecek başvuru bulunamadı.' });
  }

  await writeDb(db);
  res.status(204).send();
});

export default router;
