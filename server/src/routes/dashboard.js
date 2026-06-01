import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { readDb } from '../services/database.js';

const router = express.Router();

function monthKey(dateText) {
  return (dateText || localDateKey()).slice(0, 7);
}

function localDateKey(date = new Date()) {
  const value = date instanceof Date ? date : new Date(date);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
}

router.get('/', requireAuth, async (req, res) => {
  if (req.user.role === 'guest') {
    return res.status(403).json({ message: 'Dashboard sadece doktor paneli icindir.' });
  }

  const db = await readDb();
  const appointments = db.appointments || [];
  const sessions = db.sessions || [];
  const reviews = db.reviews || [];
  const messages = db.messages || [];
  const guests = db.guestUsers || [];
  const today = localDateKey();

  const appointmentsByDate = Object.values(appointments.reduce((acc, item) => {
    const date = item.preferredDate || item.createdAt.slice(0, 10);
    acc[date] ||= { date, total: 0, approved: 0, pending: 0, rejected: 0, completed: 0 };
    acc[date].total += 1;
    if (acc[date][item.status] !== undefined) acc[date][item.status] += 1;
    return acc;
  }, {})).sort((a, b) => a.date.localeCompare(b.date));

  const serviceDistribution = Object.values(appointments.reduce((acc, item) => {
    acc[item.service] ||= { service: item.service, count: 0 };
    acc[item.service].count += 1;
    return acc;
  }, {}));

  const statusDistribution = ['pending', 'approved', 'rejected', 'completed'].map((status) => ({
    status,
    count: appointments.filter((item) => item.status === status).length
  }));

  const monthlyMatrix = Object.values(appointments.reduce((acc, item) => {
    const key = monthKey(item.preferredDate || item.createdAt);
    acc[key] ||= { month: key, pending: 0, approved: 0, rejected: 0, completed: 0, messages: 0 };
    if (acc[key][item.status] !== undefined) acc[key][item.status] += 1;
    return acc;
  }, {}));

  messages.forEach((message) => {
    const key = monthKey(message.createdAt);
    const row = monthlyMatrix.find((item) => item.month === key);
    if (row) row.messages += 1;
    else monthlyMatrix.push({ month: key, pending: 0, approved: 0, rejected: 0, completed: 0, messages: 1 });
  });
  monthlyMatrix.sort((a, b) => a.month.localeCompare(b.month));

  const completedAppointments = appointments.filter((item) => item.status === 'completed').length;
  const approvedAppointments = appointments.filter((item) => item.status === 'approved').length;
  const pendingAppointments = appointments.filter((item) => item.status === 'pending').length;
  const unreadMessages = messages.filter((item) => item.status !== 'read').length;
  const averageRating = reviews.length
    ? Number((reviews.reduce((sum, item) => sum + Number(item.ai?.stars || item.rating || 0), 0) / reviews.length).toFixed(1))
    : 0;

  res.json({
    generatedAt: new Date().toISOString(),
    summary: {
      appointmentCount: appointments.length,
      pendingAppointments,
      approvedAppointments,
      completedAppointments,
      todaySessions: appointments.filter((item) => item.status === 'approved' && item.preferredDate === today).length,
      guestCount: guests.length,
      messageCount: messages.length,
      unreadMessages,
      sessionNoteCount: sessions.length,
      reviewCount: reviews.length,
      averageRating,
      approvalRate: appointments.length ? Math.round(((approvedAppointments + completedAppointments) / appointments.length) * 100) : 0,
      completionRate: appointments.length ? Math.round((completedAppointments / appointments.length) * 100) : 0
    },
    recentAppointments: appointments.slice(-8).reverse(),
    recentMessages: messages.slice(-6).reverse(),
    recentReviews: reviews.slice(-5).reverse(),
    serviceDistribution,
    appointmentsByDate,
    statusDistribution,
    monthlyMatrix
  });
});

export default router;
