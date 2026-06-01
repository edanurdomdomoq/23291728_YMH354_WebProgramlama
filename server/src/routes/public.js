import express from 'express';
import { readDb } from '../services/database.js';

const router = express.Router();

router.get('/site', async (req, res) => {
  const db = await readDb();
  const publishedReviews = (db.reviews || [])
    .filter((item) => item.published)
    .slice()
    .reverse()
    .map((item, index) => ({
      name: `Danışan ${index + 1}`,
      rating: item.ai?.stars || 4,
      text: item.text,
      aiSummary: item.ai?.summary,
      createdAt: item.createdAt
    }));

  res.json({
    services: db.services.filter((item) => item.published),
    posts: db.posts.filter((item) => item.published),
    testimonials: publishedReviews.length ? publishedReviews : [
      {
        name: 'E. Senturk',
        rating: 5,
        text: 'Kendimi anlaşılmış ve güvende hissettiğim bir süreçti. Seans notları ve takip sistemi çok düzenliydi.'
      },
      {
        name: 'A. Kaya',
        rating: 5,
        text: 'Online görüşmeler pratik, hatırlatıcılar ve hazırlık notları oldukça faydalıydı.'
      }
    ]
  });
});

export default router;
