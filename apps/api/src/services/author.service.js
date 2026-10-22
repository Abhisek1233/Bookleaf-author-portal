import { query } from '../database/db.js';
import { ValidationError } from '../validators.js';

export class AuthorService {
  async getDashboardSummary(authorId) {
    // 1. Author Details
    const authorRes = await query('SELECT * FROM authors WHERE id = $1', [authorId]);
    if (authorRes.rows.length === 0) {
      throw new ValidationError('Author record not found');
    }
    const author = authorRes.rows[0];

    // 2. Aggregated Book Metrics
    const booksRes = await query(
      `SELECT 
         COUNT(*) as total_books,
         COALESCE(SUM(total_copies_sold), 0) as total_copies_sold,
         COALESCE(SUM(total_royalty_earned), 0) as total_royalty_earned,
         COALESCE(SUM(royalty_paid), 0) as royalty_paid,
         COALESCE(SUM(royalty_pending), 0) as royalty_pending,
         COUNT(*) FILTER (WHERE status ILIKE '%Production%') as books_in_production,
         COUNT(*) FILTER (WHERE status ILIKE '%Published%') as published_books
       FROM books
       WHERE author_id = $1`,
      [authorId]
    );
    const metrics = booksRes.rows[0];

    // 3. Recent Tickets for this author
    const ticketsRes = await query(
      `SELECT t.id, t.ticket_number, t.subject, t.status, t.category, t.priority,
              t.created_at, t.updated_at, b.title as book_title
       FROM tickets t
       LEFT JOIN books b ON t.book_id = b.id
       WHERE t.author_id = $1
       ORDER BY t.updated_at DESC
       LIMIT 5`,
      [authorId]
    );

    return {
      author: {
        id: author.id,
        name: author.name,
        email: author.email,
        phone: author.phone,
        city: author.city,
        joined_date: author.joined_date
      },
      metrics: {
        total_books: parseInt(metrics.total_books, 10),
        total_copies_sold: parseInt(metrics.total_copies_sold, 10),
        total_royalty_earned: parseFloat(metrics.total_royalty_earned),
        royalty_paid: parseFloat(metrics.royalty_paid),
        royalty_pending: parseFloat(metrics.royalty_pending),
        books_in_production: parseInt(metrics.books_in_production, 10),
        published_books: parseInt(metrics.published_books, 10)
      },
      recent_tickets: ticketsRes.rows
    };
  }

  async getBooks(authorId, { search, status } = {}) {
    let sql = 'SELECT * FROM books WHERE author_id = $1';
    const params = [authorId];

    if (search) {
      params.push(`%${search}%`);
      sql += ` AND (title ILIKE $${params.length} OR isbn ILIKE $${params.length} OR genre ILIKE $${params.length})`;
    }

    if (status) {
      params.push(status);
      sql += ` AND status = $${params.length}`;
    }

    sql += ' ORDER BY publication_date DESC NULLS LAST, created_at DESC';

    const res = await query(sql, params);
    return res.rows.map((b) => ({
      ...b,
      total_copies_sold: parseInt(b.total_copies_sold, 10),
      mrp: b.mrp !== null ? parseFloat(b.mrp) : null,
      author_royalty_per_copy: b.author_royalty_per_copy !== null ? parseFloat(b.author_royalty_per_copy) : null,
      total_royalty_earned: parseFloat(b.total_royalty_earned),
      royalty_paid: parseFloat(b.royalty_paid),
      royalty_pending: parseFloat(b.royalty_pending),
      available_on: Array.isArray(b.available_on) ? b.available_on : []
    }));
  }

  async getBookById(authorId, bookId) {
    const res = await query(
      'SELECT * FROM books WHERE id = $1 AND author_id = $2',
      [bookId, authorId]
    );

    if (res.rows.length === 0) {
      throw new ValidationError('Book not found or does not belong to the current author');
    }

    const b = res.rows[0];
    return {
      ...b,
      total_copies_sold: parseInt(b.total_copies_sold, 10),
      mrp: b.mrp !== null ? parseFloat(b.mrp) : null,
      author_royalty_per_copy: b.author_royalty_per_copy !== null ? parseFloat(b.author_royalty_per_copy) : null,
      total_royalty_earned: parseFloat(b.total_royalty_earned),
      royalty_paid: parseFloat(b.royalty_paid),
      royalty_pending: parseFloat(b.royalty_pending),
      available_on: Array.isArray(b.available_on) ? b.available_on : []
    };
  }
}

export const authorService = new AuthorService();
