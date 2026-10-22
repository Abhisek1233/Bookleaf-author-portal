import crypto from 'crypto';
import { query } from '../database/db.js';
import { aiService } from '../ai/ai.service.js';
import { ValidationError } from '../validators.js';
import { emitTicketCreated, emitTicketMessage } from '../socket/socket.server.js';

export class TicketService {
  async createTicket({ authorId, userId, userName, bookId, subject, description, attachmentUrl, attachmentName }) {
    let bookContext = null;

    // Validate book ownership if bookId is provided
    if (bookId) {
      const bookRes = await query('SELECT * FROM books WHERE id = $1 AND author_id = $2', [bookId, authorId]);
      if (bookRes.rows.length === 0) {
        throw new ValidationError('Selected book does not belong to you or does not exist');
      }
      bookContext = bookRes.rows[0];
    }

    // AI Classification & Priority with graceful heuristic fallback
    let aiAssessment = {
      category: 'General Inquiry',
      priority: 'Medium',
      category_reason: 'Automated heuristic assessment',
      priority_reason: 'Standard priority',
      confidence: 0.85
    };

    try {
      aiAssessment = await aiService.assessTicket({
        subject,
        description,
        bookContext
      });
    } catch (err) {
      console.warn('[TicketService] AI assessment error, proceeding with fallback:', err.message);
    }

    const ticketId = `tkt-${crypto.randomUUID()}`;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TKT-${new Date().getFullYear()}-${randomSuffix}`;

    const insertSql = `
      INSERT INTO tickets (
        id, ticket_number, author_id, book_id, subject, description,
        attachment_url, attachment_name, category, priority, status,
        ai_category, ai_priority, ai_category_reason, ai_priority_reason,
        ai_confidence, is_category_overridden, is_priority_overridden,
        created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'Open', $11, $12, $13, $14, $15, FALSE, FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *
    `;

    const ticketRes = await query(insertSql, [
      ticketId,
      ticketNumber,
      authorId,
      bookId || null,
      subject,
      description,
      attachmentUrl || null,
      attachmentName || null,
      aiAssessment.category,
      aiAssessment.priority,
      aiAssessment.category,
      aiAssessment.priority,
      aiAssessment.category_reason,
      aiAssessment.priority_reason,
      aiAssessment.confidence || 0.85
    ]);

    const createdTicket = ticketRes.rows[0];

    // Emit live socket event to author and admins
    emitTicketCreated({
      ...createdTicket,
      author_name: userName,
      book_title: bookContext ? bookContext.title : null
    });

    return createdTicket;
  }

  async getAuthorTickets(authorId, { status, search } = {}) {
    let sql = `
      SELECT t.id, t.ticket_number, t.author_id, t.book_id, t.subject,
             t.category, t.priority, t.status, t.created_at, t.updated_at,
             b.title as book_title,
             (SELECT COUNT(*) FROM ticket_messages WHERE ticket_id = t.id) as message_count
      FROM tickets t
      LEFT JOIN books b ON t.book_id = b.id
      WHERE t.author_id = $1
    `;
    const params = [authorId];

    if (status) {
      params.push(status);
      sql += ` AND t.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (t.subject ILIKE $${params.length} OR t.ticket_number ILIKE $${params.length} OR b.title ILIKE $${params.length})`;
    }

    sql += ' ORDER BY t.updated_at DESC, t.created_at DESC';

    const res = await query(sql, params);
    return res.rows;
  }

  async getAuthorTicketDetail(authorId, ticketId) {
    const ticketRes = await query(
      `SELECT t.*, b.title as book_title, b.isbn as book_isbn, b.status as book_status
       FROM tickets t
       LEFT JOIN books b ON t.book_id = b.id
       WHERE t.id = $1 AND t.author_id = $2`,
      [ticketId, authorId]
    );

    if (ticketRes.rows.length === 0) {
      throw new ValidationError('Ticket not found or unauthorized');
    }

    const ticket = ticketRes.rows[0];

    // Fetch ONLY public messages (INTERNAL NOTES ARE NEVER RETURNED TO AUTHORS)
    const messagesRes = await query(
      `SELECT id, ticket_id, sender_id, sender_role, sender_name, message, created_at
       FROM ticket_messages
       WHERE ticket_id = $1
       ORDER BY created_at ASC`,
      [ticketId]
    );

    return {
      ...ticket,
      messages: messagesRes.rows
    };
  }

  async addAuthorReply({ authorId, userId, userName, ticketId, message }) {
    // Verify ticket ownership
    const ticketRes = await query(
      'SELECT id, author_id, status FROM tickets WHERE id = $1 AND author_id = $2',
      [ticketId, authorId]
    );

    if (ticketRes.rows.length === 0) {
      throw new ValidationError('Ticket not found or unauthorized');
    }

    const msgId = `msg-${crypto.randomUUID()}`;
    const insertRes = await query(
      `INSERT INTO ticket_messages (id, ticket_id, sender_id, sender_role, sender_name, message, created_at)
       VALUES ($1, $2, $3, 'author', $4, $5, CURRENT_TIMESTAMP)
       RETURNING *`,
      [msgId, ticketId, userId, userName, message]
    );

    // If ticket was resolved/closed, an author reply may reopen or mark as in progress
    await query(
      `UPDATE tickets
       SET updated_at = CURRENT_TIMESTAMP,
           status = CASE WHEN status = 'Resolved' THEN 'In Progress' ELSE status END
       WHERE id = $1`,
      [ticketId]
    );

    const newMsg = insertRes.rows[0];
    emitTicketMessage(ticketId, authorId, newMsg);

    return newMsg;
  }
}

export const ticketService = new TicketService();
