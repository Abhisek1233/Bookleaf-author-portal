import crypto from 'crypto';
import { query } from '../database/db.js';
import { aiService } from '../ai/ai.service.js';
import { ValidationError } from '../validators.js';
import { emitTicketUpdated, emitTicketMessage, emitInternalNote } from '../socket/socket.server.js';
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '../constants.js';

export class AdminService {
  async getDashboardMetrics() {
    const countsRes = await query(`
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(*) FILTER (WHERE status = 'Open') as open_tickets,
        COUNT(*) FILTER (WHERE status = 'In Progress') as in_progress_tickets,
        COUNT(*) FILTER (WHERE status IN ('Open', 'In Progress') AND priority IN ('Critical', 'High')) as urgent_unresolved_tickets,
        COUNT(*) FILTER (WHERE status = 'Resolved') as resolved_tickets,
        COUNT(*) FILTER (WHERE status = 'Closed') as closed_tickets,
        COUNT(*) FILTER (WHERE status IN ('Open', 'In Progress') AND (
          SELECT COUNT(*) FROM ticket_messages WHERE ticket_id = tickets.id AND sender_role = 'admin'
        ) = 0) as tickets_awaiting_response
      FROM tickets
    `);

    const summary = countsRes.rows[0];

    // Priority distribution
    const priorityRes = await query(`
      SELECT priority, COUNT(*) as count 
      FROM tickets 
      GROUP BY priority
    `);
    const priorityMap = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    priorityRes.rows.forEach(r => {
      if (priorityMap[r.priority] !== undefined) {
        priorityMap[r.priority] = parseInt(r.count, 10);
      }
    });

    // Category distribution
    const categoryRes = await query(`
      SELECT category, COUNT(*) as count 
      FROM tickets 
      GROUP BY category
    `);
    const categoryMap = {};
    TICKET_CATEGORIES.forEach(c => { categoryMap[c] = 0; });
    categoryRes.rows.forEach(r => {
      categoryMap[r.category] = parseInt(r.count, 10);
    });

    // Oldest urgent unresolved tickets (Critical or High)
    const urgentTicketsRes = await query(`
      SELECT t.id, t.ticket_number, t.subject, t.category, t.priority, t.status,
             t.created_at, t.updated_at, a.name as author_name, b.title as book_title
      FROM tickets t
      JOIN authors a ON t.author_id = a.id
      LEFT JOIN books b ON t.book_id = b.id
      WHERE t.status IN ('Open', 'In Progress') AND t.priority IN ('Critical', 'High')
      ORDER BY 
        CASE WHEN t.priority = 'Critical' THEN 1 ELSE 2 END,
        t.created_at ASC
      LIMIT 6
    `);

    return {
      metrics: {
        total_tickets: parseInt(summary.total_tickets, 10),
        open_tickets: parseInt(summary.open_tickets, 10),
        in_progress_tickets: parseInt(summary.in_progress_tickets, 10),
        urgent_unresolved_tickets: parseInt(summary.urgent_unresolved_tickets, 10),
        tickets_awaiting_response: parseInt(summary.tickets_awaiting_response, 10),
        resolved_tickets: parseInt(summary.resolved_tickets, 10),
        closed_tickets: parseInt(summary.closed_tickets, 10)
      },
      priority_distribution: priorityMap,
      category_distribution: categoryMap,
      oldest_urgent_tickets: urgentTicketsRes.rows
    };
  }

  async getTicketQueue({ page = 1, limit = 10, status, category, priority, search, sort = 'urgent_first' }) {
    const offset = (page - 1) * limit;
    let whereClauses = [];
    let params = [];

    if (status) {
      params.push(status);
      whereClauses.push(`t.status = $${params.length}`);
    }

    if (category) {
      params.push(category);
      whereClauses.push(`t.category = $${params.length}`);
    }

    if (priority) {
      params.push(priority);
      whereClauses.push(`t.priority = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      whereClauses.push(`(
        t.subject ILIKE $${params.length} OR 
        t.ticket_number ILIKE $${params.length} OR 
        a.name ILIKE $${params.length} OR 
        a.email ILIKE $${params.length} OR 
        b.title ILIKE $${params.length}
      )`);
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    let orderBySql = '';
    switch (sort) {
      case 'urgent_first':
        // Unresolved first, then Critical -> High -> Medium -> Low, then oldest created
        orderBySql = `
          ORDER BY 
            CASE WHEN t.status IN ('Open', 'In Progress') THEN 0 ELSE 1 END,
            CASE 
              WHEN t.priority = 'Critical' THEN 1
              WHEN t.priority = 'High' THEN 2
              WHEN t.priority = 'Medium' THEN 3
              ELSE 4
            END,
            t.created_at ASC
        `;
        break;
      case 'newest':
        orderBySql = 'ORDER BY t.created_at DESC';
        break;
      case 'oldest':
        orderBySql = 'ORDER BY t.created_at ASC';
        break;
      case 'last_updated':
      default:
        orderBySql = 'ORDER BY t.updated_at DESC';
        break;
    }

    // Count total matches
    const countRes = await query(`
      SELECT COUNT(*) as total 
      FROM tickets t
      JOIN authors a ON t.author_id = a.id
      LEFT JOIN books b ON t.book_id = b.id
      ${whereSql}
    `, params);
    const totalRecords = parseInt(countRes.rows[0].total, 10);

    // Fetch page records
    params.push(limit);
    const limitParam = `$${params.length}`;
    params.push(offset);
    const offsetParam = `$${params.length}`;

    const itemsRes = await query(`
      SELECT t.id, t.ticket_number, t.author_id, t.book_id, t.subject,
             t.category, t.priority, t.status, t.is_category_overridden,
             t.is_priority_overridden, t.assigned_to_id, t.created_at, t.updated_at,
             a.name as author_name, a.email as author_email,
             b.title as book_title,
             u.name as assigned_admin_name,
             (SELECT COUNT(*) FROM ticket_messages WHERE ticket_id = t.id) as message_count,
             (SELECT COUNT(*) FROM internal_notes WHERE ticket_id = t.id) as note_count
      FROM tickets t
      JOIN authors a ON t.author_id = a.id
      LEFT JOIN books b ON t.book_id = b.id
      LEFT JOIN users u ON t.assigned_to_id = u.id
      ${whereSql}
      ${orderBySql}
      LIMIT ${limitParam} OFFSET ${offsetParam}
    `, params);

    return {
      tickets: itemsRes.rows,
      pagination: {
        page,
        limit,
        total: totalRecords,
        total_pages: Math.ceil(totalRecords / limit)
      }
    };
  }

  async getTicketDetail(ticketId) {
    const ticketRes = await query(`
      SELECT t.*, 
             a.name as author_name, a.email as author_email, a.phone as author_phone, a.city as author_city, a.joined_date as author_joined_date,
             b.title as book_title, b.isbn as book_isbn, b.status as book_status, b.genre as book_genre,
             b.mrp as book_mrp, b.total_copies_sold as book_copies_sold, b.total_royalty_earned as book_royalty_earned,
             b.royalty_paid as book_royalty_paid, b.royalty_pending as book_royalty_pending,
             b.last_royalty_payout_date as book_last_payout, b.print_partner as book_print_partner,
             b.available_on as book_available_on,
             u.name as assigned_admin_name
      FROM tickets t
      JOIN authors a ON t.author_id = a.id
      LEFT JOIN books b ON t.book_id = b.id
      LEFT JOIN users u ON t.assigned_to_id = u.id
      WHERE t.id = $1
    `, [ticketId]);

    if (ticketRes.rows.length === 0) {
      throw new ValidationError('Ticket not found');
    }

    const t = ticketRes.rows[0];

    // Fetch author context: all books count and total royalty pending across all books
    const authorContextRes = await query(`
      SELECT 
        COUNT(*) as total_author_books,
        COALESCE(SUM(royalty_pending), 0) as total_author_royalty_pending
      FROM books
      WHERE author_id = $1
    `, [t.author_id]);
    const authorCtx = authorContextRes.rows[0];

    // Fetch public messages
    const messagesRes = await query(`
      SELECT id, ticket_id, sender_id, sender_role, sender_name, message, created_at
      FROM ticket_messages
      WHERE ticket_id = $1
      ORDER BY created_at ASC
    `, [ticketId]);

    // Fetch internal notes
    const notesRes = await query(`
      SELECT id, ticket_id, admin_id, admin_name, content, created_at
      FROM internal_notes
      WHERE ticket_id = $1
      ORDER BY created_at ASC
    `, [ticketId]);

    // Fetch cached AI draft if available
    const draftRes = await query(`
      SELECT draft_text, model_used, updated_at
      FROM ai_drafts
      WHERE ticket_id = $1
    `, [ticketId]);

    return {
      ticket: {
        id: t.id,
        ticket_number: t.ticket_number,
        author_id: t.author_id,
        book_id: t.book_id,
        subject: t.subject,
        description: t.description,
        attachment_url: t.attachment_url,
        attachment_name: t.attachment_name,
        category: t.category,
        priority: t.priority,
        status: t.status,
        ai_category: t.ai_category,
        ai_priority: t.ai_priority,
        ai_category_reason: t.ai_category_reason,
        ai_priority_reason: t.ai_priority_reason,
        ai_confidence: t.ai_confidence ? parseFloat(t.ai_confidence) : null,
        is_category_overridden: t.is_category_overridden,
        is_priority_overridden: t.is_priority_overridden,
        override_reason: t.override_reason,
        assigned_to_id: t.assigned_to_id,
        assigned_admin_name: t.assigned_admin_name,
        created_at: t.created_at,
        updated_at: t.updated_at,
        resolved_at: t.resolved_at,
        closed_at: t.closed_at
      },
      author: {
        id: t.author_id,
        name: t.author_name,
        email: t.author_email,
        phone: t.author_phone,
        city: t.author_city,
        joined_date: t.author_joined_date,
        total_books: parseInt(authorCtx.total_author_books, 10),
        total_royalty_pending: parseFloat(authorCtx.total_author_royalty_pending)
      },
      book: t.book_id ? {
        id: t.book_id,
        title: t.book_title,
        isbn: t.book_isbn,
        status: t.book_status,
        genre: t.book_genre,
        mrp: t.book_mrp ? parseFloat(t.book_mrp) : null,
        total_copies_sold: parseInt(t.book_copies_sold || 0, 10),
        total_royalty_earned: parseFloat(t.book_royalty_earned || 0),
        royalty_paid: parseFloat(t.book_royalty_paid || 0),
        royalty_pending: parseFloat(t.book_royalty_pending || 0),
        last_royalty_payout_date: t.book_last_payout,
        print_partner: t.book_print_partner,
        available_on: Array.isArray(t.book_available_on) ? t.book_available_on : []
      } : null,
      messages: messagesRes.rows,
      internal_notes: notesRes.rows,
      ai_draft: draftRes.rows.length > 0 ? draftRes.rows[0] : null
    };
  }

  async overrideCategoryPriority(ticketId, { category, priority, override_reason }) {
    const updateRes = await query(`
      UPDATE tickets
      SET category = $1,
          priority = $2,
          override_reason = $3,
          is_category_overridden = TRUE,
          is_priority_overridden = TRUE,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *
    `, [category, priority, override_reason || 'Manual administrator override', ticketId]);

    if (updateRes.rows.length === 0) {
      throw new ValidationError('Ticket not found');
    }

    const updated = updateRes.rows[0];
    emitTicketUpdated(updated);
    return updated;
  }

  async updateTicketStatus(ticketId, status) {
    let extraDateSql = '';
    if (status === 'Resolved') {
      extraDateSql = ', resolved_at = CURRENT_TIMESTAMP';
    } else if (status === 'Closed') {
      extraDateSql = ', closed_at = CURRENT_TIMESTAMP';
    }

    const updateRes = await query(`
      UPDATE tickets
      SET status = $1,
          updated_at = CURRENT_TIMESTAMP
          ${extraDateSql}
      WHERE id = $2
      RETURNING *
    `, [status, ticketId]);

    if (updateRes.rows.length === 0) {
      throw new ValidationError('Ticket not found');
    }

    const updated = updateRes.rows[0];
    emitTicketUpdated(updated);
    return updated;
  }

  async assignTicket(ticketId, adminId) {
    const updateRes = await query(`
      UPDATE tickets
      SET assigned_to_id = $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *
    `, [adminId || null, ticketId]);

    if (updateRes.rows.length === 0) {
      throw new ValidationError('Ticket not found');
    }

    const updated = updateRes.rows[0];
    emitTicketUpdated(updated);
    return updated;
  }

  async addInternalNote(ticketId, adminId, adminName, content) {
    const noteId = `note-${crypto.randomUUID()}`;
    const insertRes = await query(`
      INSERT INTO internal_notes (id, ticket_id, admin_id, admin_name, content, created_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING *
    `, [noteId, ticketId, adminId, adminName, content]);

    await query('UPDATE tickets SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [ticketId]);

    const note = insertRes.rows[0];
    // Broadcast STRICTLY to admins only!
    emitInternalNote(ticketId, note);
    return note;
  }

  async sendAdminReply({ ticketId, adminId, adminName, message, newStatus }) {
    const ticketRes = await query('SELECT author_id, status FROM tickets WHERE id = $1', [ticketId]);
    if (ticketRes.rows.length === 0) {
      throw new ValidationError('Ticket not found');
    }
    const ticket = ticketRes.rows[0];

    const msgId = `msg-${crypto.randomUUID()}`;
    const msgRes = await query(`
      INSERT INTO ticket_messages (id, ticket_id, sender_id, sender_role, sender_name, message, created_at)
      VALUES ($1, $2, $3, 'admin', $4, $5, CURRENT_TIMESTAMP)
      RETURNING *
    `, [msgId, ticketId, adminId, adminName, message]);

    // Update ticket status if provided or default to 'In Progress' if currently 'Open'
    const targetStatus = newStatus || (ticket.status === 'Open' ? 'In Progress' : ticket.status);
    let resolvedSql = targetStatus === 'Resolved' ? ', resolved_at = CURRENT_TIMESTAMP' : '';

    const updatedTicketRes = await query(`
      UPDATE tickets
      SET status = $1,
          updated_at = CURRENT_TIMESTAMP
          ${resolvedSql}
      WHERE id = $2
      RETURNING *
    `, [targetStatus, ticketId]);

    const newMsg = msgRes.rows[0];
    emitTicketMessage(ticketId, ticket.author_id, newMsg);
    emitTicketUpdated(updatedTicketRes.rows[0]);

    return {
      message: newMsg,
      ticket: updatedTicketRes.rows[0]
    };
  }

  async generateAiDraft(ticketId, forceRegenerate = false) {
    const detail = await this.getTicketDetail(ticketId);
    const { ticket, author, book } = detail;

    const draft = await aiService.getOrCreateDraftResponse({
      ticketId: ticket.id,
      subject: ticket.subject,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      authorName: author.name,
      bookContext: book,
      forceRegenerate
    });

    return draft;
  }

  async reassessTicketClassification(ticketId) {
    const detail = await this.getTicketDetail(ticketId);
    const { ticket, book } = detail;

    const assessment = await aiService.assessTicket({
      subject: ticket.subject,
      description: ticket.description,
      bookContext: book
    });

    const updateRes = await query(`
      UPDATE tickets
      SET ai_category = $1,
          ai_priority = $2,
          ai_category_reason = $3,
          ai_priority_reason = $4,
          ai_confidence = $5,
          category = CASE WHEN is_category_overridden THEN category ELSE $1 END,
          priority = CASE WHEN is_priority_overridden THEN priority ELSE $2 END,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `, [
      assessment.category,
      assessment.priority,
      assessment.category_reason,
      assessment.priority_reason,
      assessment.confidence || 0.85,
      ticketId
    ]);

    const updated = updateRes.rows[0];
    emitTicketUpdated(updated);
    return {
      assessment,
      ticket: updated
    };
  }
}

export const adminService = new AdminService();
