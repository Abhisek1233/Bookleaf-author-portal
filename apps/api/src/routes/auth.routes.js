import { Router } from 'express';
import { login, getCurrentUser, logout } from '../controllers/auth.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { createRateLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();
const loginRateLimiter = createRateLimiter({
  windowMs: 60000,
  max: 15,
  message: 'Too many login attempts. Please wait a minute before trying again.'
});

router.post('/login', loginRateLimiter, login);
router.get('/me', requireAuth, getCurrentUser);
router.post('/logout', requireAuth, logout);

export default router;
