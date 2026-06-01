import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
  // Protected endpointlerde frontend token'ı Authorization header ile gönderir:
  // Authorization: Bearer <jwt-token>
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Oturum bilgisi gerekli. Lütfen tekrar giriş yapın.', code: 'AUTH_REQUIRED' });
  }

  try {
    // Token geçerliyse çözülen kullanıcı bilgisi req.user içine eklenir.
    // Route dosyaları bu sayede sadece giriş yapan kullanıcının verisini işler.
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    next();
  } catch {
    res.status(401).json({ message: 'Oturum süresi doldu. Lütfen tekrar giriş yapın.', code: 'TOKEN_EXPIRED' });
  }
}
