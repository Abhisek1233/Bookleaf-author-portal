import { Router } from 'express';
import {
  getDashboard,
  getTicketQueue,
  getTicketDetail,
  overrideCategoryPriority,
  updateStatus,
  assignTicket,
  addInternalNote,
  sendPublicReply,
  generateAiDraft,
  reassessAiClassification
} from '../controllers/admin.controller.js';
import { requireAuth, requireAdmin } from '../middleware/auth.middleware.js';
import { createRateLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

// Protect all admin routes
router.use(requireAuth, requireAdmin);

const aiActionRateLimiter = createRateLimiter({
  windowMs: 60000,
  max: 20,
  message: 'AI request limit reached. Please wait a moment.'
});

router.get('/dashboard', getDashboard);
router.get('/tickets', getTicketQueue);
router.get('/tickets/:ticketId', getTicketDetail);
router.patch('/tickets/:ticketId/override', overrideCategoryPriority);
router.patch('/tickets/:ticketId/status', updateStatus);
router.patch('/tickets/:ticketId/assign', assignTicket);
router.post('/tickets/:ticketId/notes', addInternalNote);
router.post('/tickets/:ticketId/reply', sendPublicReply);
router.post('/tickets/:ticketId/draft', aiActionRateLimiter, generateAiDraft);
router.post('/tickets/:ticketId/reassess', aiActionRateLimiter, reassessAiClassification);

export default router;
