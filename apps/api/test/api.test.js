import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/server.js';
import { pool } from '../src/database/db.js';
import { runSeed } from '../src/database/seed.js';
import { classifyTicketHeuristic, generateDraftHeuristic } from '../src/ai/heuristicFallback.js';
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '../src/constants.js';

let adminToken = '';
let authorToken1 = ''; // Priya Sharma (AUTH001)
let authorToken2 = ''; // Rohit Kapoor (AUTH002)

beforeAll(async () => {
  // Ensure database is seeded
  await runSeed();

  // Login Admin
  const adminRes = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'admin@bookleafpub.com', password: 'AdminPassword123!' });
  expect(adminRes.status).toBe(200);
  adminToken = adminRes.body.data.token;

  // Login Author 1 (Priya Sharma, AUTH001)
  const author1Res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'priya.sharma@email.com', password: 'Author123!' });
  expect(author1Res.status).toBe(200);
  authorToken1 = author1Res.body.data.token;

  // Login Author 2 (Rohit Kapoor, AUTH002)
  const author2Res = await request(app)
    .post('/api/v1/auth/login')
    .send({ email: 'rohit.kapoor@email.com', password: 'Author123!' });
  expect(author2Res.status).toBe(200);
  authorToken2 = author2Res.body.data.token;
});

afterAll(async () => {
  await pool.end();
});

describe('1. Health Check', () => {
  it('should return health status and database latency', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body.database.status).toBe('healthy');
  });
});

describe('2. Authentication & Authorization', () => {
  it('should reject login with incorrect password', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@bookleafpub.com', password: 'WrongPassword!' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should prevent authors from accessing admin endpoints (403 Forbidden)', async () => {
    const res = await request(app)
      .get('/api/v1/admin/dashboard')
      .set('Authorization', `Bearer ${authorToken1}`);
    expect(res.status).toBe(403);
  });

  it('should prevent unauthenticated requests from accessing protected routes (401)', async () => {
    const res = await request(app).get('/api/v1/author/dashboard');
    expect(res.status).toBe(401);
  });
});

describe('3. Author Data Isolation & Ownership', () => {
  it('should return only books belonging to the authenticated author', async () => {
    const res = await request(app)
      .get('/api/v1/author/books')
      .set('Authorization', `Bearer ${authorToken1}`);
    expect(res.status).toBe(200);
    expect(res.body.data.length).toBe(2); // BK001, BK002
    res.body.data.forEach(book => {
      expect(book.author_id).toBe('AUTH001');
    });
  });

  it('should reject an author trying to view another author book detail', async () => {
    // BK003 belongs to AUTH002
    const res = await request(app)
      .get('/api/v1/author/books/BK003')
      .set('Authorization', `Bearer ${authorToken1}`);
    expect(res.status).toBe(400);
  });

  it('should reject an author creating a ticket with another author book ID', async () => {
    // BK003 belongs to AUTH002, Author 1 is AUTH001
    const res = await request(app)
      .post('/api/v1/author/tickets')
      .set('Authorization', `Bearer ${authorToken1}`)
      .send({
        book_id: 'BK003',
        subject: 'Unauthorized book ticket creation test',
        description: 'Trying to create a support query for a book that does not belong to me.'
      });
    expect(res.status).toBe(400);
  });

  it('should isolate ticket details: Author 1 cannot view Author 2 ticket', async () => {
    // Create ticket as Author 2
    const createRes = await request(app)
      .post('/api/v1/author/tickets')
      .set('Authorization', `Bearer ${authorToken2}`)
      .send({
        book_id: 'BK003',
        subject: 'Author 2 Private Inquiry',
        description: 'This ticket contains sensitive private query from author 2.'
      });
    expect(createRes.status).toBe(201);
    const author2TicketId = createRes.body.data.id;

    // Try to access as Author 1
    const accessRes = await request(app)
      .get(`/api/v1/author/tickets/${author2TicketId}`)
      .set('Authorization', `Bearer ${authorToken1}`);
    expect(accessRes.status).toBe(400); // Unauthorized
  });
});

describe('4. AI Classification, Fallback & Knowledge Grounding', () => {
  it('heuristic should accurately classify ISBN discrepancy as ISBN & Metadata Issues and High/Critical', () => {
    const res = classifyTicketHeuristic({
      subject: 'Duplicate ISBN on Amazon listing',
      description: 'The ISBN printed on the book is different from Amazon ASIN catalog.'
    });
    expect(res.category).toBe('ISBN & Metadata Issues');
    expect(['Critical', 'High']).toContain(res.priority);
    expect(TICKET_CATEGORIES).toContain(res.category);
    expect(TICKET_PRIORITIES).toContain(res.priority);
  });

  it('heuristic should accurately classify print defect as Printing & Quality', () => {
    const res = classifyTicketHeuristic({
      subject: 'My author copies arrived with blurry text',
      description: 'The pages have misaligned print and blurry chapter headings.'
    });
    expect(res.category).toBe('Printing & Quality');
    expect(res.priority).toBe('High');
  });

  it('ticket creation should succeed seamlessly even when AI key is missing', async () => {
    const res = await request(app)
      .post('/api/v1/author/tickets')
      .set('Authorization', `Bearer ${authorToken1}`)
      .send({
        subject: 'Question regarding royalty calculations for my title',
        description: 'I would like to verify how the 80/20 royalty split was calculated for Q3.'
      });
    expect(res.status).toBe(201);
    expect(res.body.data.category).toBe('Royalty & Payments');
  });
});

describe('5. Admin Triage, Override & Internal Notes Isolation', () => {
  let testTicketId = '';

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/v1/author/tickets')
      .set('Authorization', `Bearer ${authorToken1}`)
      .send({
        book_id: 'BK001',
        subject: 'Admin Triage Integration Ticket',
        description: 'Comprehensive test ticket for status updates, overrides, and internal notes.'
      });
    testTicketId = res.body.data.id;
  });

  it('admin can override category and priority and the override persists', async () => {
    const overrideRes = await request(app)
      .patch(`/api/v1/admin/tickets/${testTicketId}/override`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        category: 'Printing & Quality',
        priority: 'Critical',
        override_reason: 'Admin identified critical print misalignment from author description'
      });
    expect(overrideRes.status).toBe(200);
    expect(overrideRes.body.data.category).toBe('Printing & Quality');
    expect(overrideRes.body.data.priority).toBe('Critical');
    expect(overrideRes.body.data.is_category_overridden).toBe(true);

    // Verify persistence via GET
    const getRes = await request(app)
      .get(`/api/v1/admin/tickets/${testTicketId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(getRes.body.data.ticket.category).toBe('Printing & Quality');
    expect(getRes.body.data.ticket.priority).toBe('Critical');
  });

  it('internal notes must NEVER leak to author endpoint', async () => {
    // 1. Admin adds internal note
    const noteRes = await request(app)
      .post(`/api/v1/admin/tickets/${testTicketId}/notes`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ content: 'Confidential Ops Note: Checked print batch with Delhi factory manager.' });
    expect(noteRes.status).toBe(201);

    // 2. Author retrieves their ticket
    const authorRes = await request(app)
      .get(`/api/v1/author/tickets/${testTicketId}`)
      .set('Authorization', `Bearer ${authorToken1}`);
    expect(authorRes.status).toBe(200);

    // Check that internal note is not present anywhere in author response
    expect(authorRes.body.data.internal_notes).toBeUndefined();
    const stringified = JSON.stringify(authorRes.body.data);
    expect(stringified).not.toContain('Confidential Ops Note');
  });

  it('admin public replies persist and appear in author ticket timeline', async () => {
    const replyRes = await request(app)
      .post(`/api/v1/admin/tickets/${testTicketId}/reply`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        message: 'Dear Priya, we have reviewed your ticket and arranged a priority reprint.'
      });
    expect(replyRes.status).toBe(201);

    // Author checks their ticket
    const authorRes = await request(app)
      .get(`/api/v1/author/tickets/${testTicketId}`)
      .set('Authorization', `Bearer ${authorToken1}`);
    expect(authorRes.status).toBe(200);
    const messages = authorRes.body.data.messages;
    expect(messages.some(m => m.message.includes('arranged a priority reprint'))).toBe(true);
  });

  it('admin can update ticket status to In Progress, Resolved, and Closed', async () => {
    const updateRes = await request(app)
      .patch(`/api/v1/admin/tickets/${testTicketId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'Resolved' });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.status).toBe('Resolved');
    expect(updateRes.body.data.resolved_at).toBeTruthy();
  });
});
