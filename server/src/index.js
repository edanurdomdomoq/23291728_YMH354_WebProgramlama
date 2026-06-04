import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import taskRoutes from './routes/tasks.js';
import dashboardRoutes from './routes/dashboard.js';
import publicRoutes from './routes/public.js';
import appointmentRoutes from './routes/appointments.js';
import sessionRoutes from './routes/sessions.js';
import reviewRoutes from './routes/reviews.js';
import messageRoutes from './routes/messages.js';
import contentRoutes from './routes/content.js';
import { ensureDatabase } from './services/database.js';

const app = express();
const port = process.env.PORT || 5000;

function protectAsyncRoutes(router) {
  router.stack?.forEach((layer) => {
    if (layer.route?.stack) {
      layer.route.stack.forEach((routeLayer) => {
        const handler = routeLayer.handle;
        if (handler.length < 4) {
          routeLayer.handle = (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);
        }
      });
    } else if (layer.handle?.stack) {
      protectAsyncRoutes(layer.handle);
    }
  });
  return router;
}

// JSON veritabanı dosyası yoksa uygulama başlamadan önce oluşturulur.
await ensureDatabase();

// React uygulaması farklı portta çalıştığı için CORS aktif edilir.
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '8mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Klinik API' });
});

app.use('/api/auth', protectAsyncRoutes(authRoutes));
app.use('/api/tasks', protectAsyncRoutes(taskRoutes));
app.use('/api/dashboard', protectAsyncRoutes(dashboardRoutes));
app.use('/api/public', protectAsyncRoutes(publicRoutes));
app.use('/api/appointments', protectAsyncRoutes(appointmentRoutes));
app.use('/api/sessions', protectAsyncRoutes(sessionRoutes));
app.use('/api/reviews', protectAsyncRoutes(reviewRoutes));
app.use('/api/messages', protectAsyncRoutes(messageRoutes));
app.use('/api/content', protectAsyncRoutes(contentRoutes));

// Merkezi hata yakalama katmanı.
// Route içinde next(err) kullanılırsa cevap formatı burada standartlaşır.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

app.listen(port, () => {
  console.log(`Klinik API running on http://localhost:${port}`);
});
