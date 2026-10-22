import { Router } from 'express';
import {
  getDashboard,
  getBooks,
  getBookById,
  getTickets,
  getTicketById,
  createTicket,
  replyToTicket
} from '../controllers/author.controller.js';
import { requireAuth, requireAuthor } from '../middleware/auth.middleware.js';
import { createRateLimiter } from '../middleware/rateLimiter.middleware.js';

const router = Router();

// Protect all author routes
router.use(requireAuth, requireAuthor);

const ticketCreateRateLimiter = createRateLimiter({
  windowMs: 60000,
  max: 10,
  message: 'Ticket creation limit reached. Please wait a moment.'
});

router.get('/dashboard', getDashboard);
router.get('/books', getBooks);
router.get('/books/:bookId', getBookById);
router.get('/tickets', getTickets);
router.get('/tickets/:ticketId', getTicketById);
router.post('/tickets', ticketCreateRateLimiter, createTicket);
router.post('/tickets/:ticketId/reply', replyToTicket);

export default router;
