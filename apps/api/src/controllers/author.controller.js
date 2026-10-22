import { authorService } from '../services/author.service.js';
import { ticketService } from '../services/ticket.service.js';
import { validateCreateTicket, validatePublicReply } from '../validators.js';

export async function getDashboard(req, res, next) {
  try {
    const authorId = req.user.author_id;
    if (!authorId) {
      return res.status(403).json({ success: false, error: { message: 'Author ID not linked to this account' } });
    }
    const data = await authorService.getDashboardSummary(authorId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getBooks(req, res, next) {
  try {
    const authorId = req.user.author_id;
    const { search, status } = req.query;
    const data = await authorService.getBooks(authorId, { search, status });
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getBookById(req, res, next) {
  try {
    const authorId = req.user.author_id;
    const { bookId } = req.params;
    const data = await authorService.getBookById(authorId, bookId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getTickets(req, res, next) {
  try {
    const authorId = req.user.author_id;
    const { status, search } = req.query;
    const data = await ticketService.getAuthorTickets(authorId, { status, search });
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function getTicketById(req, res, next) {
  try {
    const authorId = req.user.author_id;
    const { ticketId } = req.params;
    const data = await ticketService.getAuthorTicketDetail(authorId, ticketId);
    res.status(200).json({ success: true, data });
  } catch (err) {
    next(err);
  }
}

export async function createTicket(req, res, next) {
  try {
    const authorId = req.user.author_id;
    if (!authorId) {
      return res.status(403).json({ success: false, error: { message: 'Author ID not linked' } });
    }
    const validated = validateCreateTicket(req.body);
    const data = await ticketService.createTicket({
      authorId,
      userId: req.user.id,
      userName: req.user.name,
      bookId: validated.book_id,
      subject: validated.subject,
      description: validated.description,
      attachmentUrl: validated.attachment_url,
      attachmentName: validated.attachment_name
    });
    res.status(201).json({
      success: true,
      message: 'Support ticket submitted successfully',
      data
    });
  } catch (err) {
    next(err);
  }
}

export async function replyToTicket(req, res, next) {
  try {
    const authorId = req.user.author_id;
    const { ticketId } = req.params;
    const validated = validatePublicReply(req.body);
    const data = await ticketService.addAuthorReply({
      authorId,
      userId: req.user.id,
      userName: req.user.name,
      ticketId,
      message: validated.message
    });
    res.status(201).json({
      success: true,
      message: 'Reply sent successfully',
      data
    });
  } catch (err) {
    next(err);
  }
}
