import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query, pool } from './db.js';
import { runMigration } from './migrate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function runSeed() {
  console.log('--- Starting Idempotent Database Seed ---');
  await runMigration();

  // 1. Load bookleaf_sample_data.json
  let sampleDataPath = path.resolve(__dirname, '../../../../bookleaf_sample_data.json');
  if (!fs.existsSync(sampleDataPath)) {
    sampleDataPath = path.resolve(process.cwd(), '../../bookleaf_sample_data.json');
  }
  if (!fs.existsSync(sampleDataPath)) {
    sampleDataPath = path.resolve(process.cwd(), 'bookleaf_sample_data.json');
  }
  const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf8'));

  const ADMIN_PASSWORD = process.env.ADMIN_DEFAULT_PASSWORD || 'AdminPassword123!';
  const AUTHOR_PASSWORD = process.env.AUTHOR_DEFAULT_PASSWORD || 'Author123!';

  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const authorPasswordHash = await bcrypt.hash(AUTHOR_PASSWORD, 10);

  // 2. Seed Admin User
  const adminId = 'admin-user-001';
  const adminEmail = 'admin@bookleafpub.com';
  await query(
    `INSERT INTO users (id, email, password_hash, role, name)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO UPDATE 
     SET password_hash = EXCLUDED.password_hash, name = EXCLUDED.name`,
    [adminId, adminEmail, adminPasswordHash, 'admin', 'Editorial Operations Manager']
  );
  console.log('✓ Admin account seeded:', adminEmail);

  // 3. Seed Authors & Author Users
  let totalAuthors = 0;
  let totalBooks = 0;

  for (const author of sampleData.authors) {
    totalAuthors++;
    await query(
      `INSERT INTO authors (id, name, email, phone, city, joined_date, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO UPDATE
       SET name = EXCLUDED.name,
           email = EXCLUDED.email,
           phone = EXCLUDED.phone,
           city = EXCLUDED.city,
           joined_date = EXCLUDED.joined_date,
           updated_at = CURRENT_TIMESTAMP`,
      [
        author.author_id,
        author.name,
        author.email,
        author.phone,
        author.city,
        author.joined_date
      ]
    );

    // Create user login for author
    const authorUserId = `user-${author.author_id.toLowerCase()}`;
    await query(
      `INSERT INTO users (id, email, password_hash, role, name, author_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE
       SET password_hash = EXCLUDED.password_hash,
           name = EXCLUDED.name,
           author_id = EXCLUDED.author_id`,
      [authorUserId, author.email, authorPasswordHash, 'author', author.name, author.author_id]
    );

    // Seed Books for this author
    for (const book of author.books) {
      totalBooks++;
      await query(
        `INSERT INTO books (
          id, author_id, title, isbn, genre, publication_date, status,
          mrp, author_royalty_per_copy, total_copies_sold, total_royalty_earned,
          royalty_paid, royalty_pending, last_royalty_payout_date, print_partner,
          available_on, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO UPDATE
        SET author_id = EXCLUDED.author_id,
            title = EXCLUDED.title,
            isbn = EXCLUDED.isbn,
            genre = EXCLUDED.genre,
            publication_date = EXCLUDED.publication_date,
            status = EXCLUDED.status,
            mrp = EXCLUDED.mrp,
            author_royalty_per_copy = EXCLUDED.author_royalty_per_copy,
            total_copies_sold = EXCLUDED.total_copies_sold,
            total_royalty_earned = EXCLUDED.total_royalty_earned,
            royalty_paid = EXCLUDED.royalty_paid,
            royalty_pending = EXCLUDED.royalty_pending,
            last_royalty_payout_date = EXCLUDED.last_royalty_payout_date,
            print_partner = EXCLUDED.print_partner,
            available_on = EXCLUDED.available_on,
            updated_at = CURRENT_TIMESTAMP`,
        [
          book.book_id,
          author.author_id,
          book.title,
          book.isbn,
          book.genre,
          book.publication_date,
          book.status,
          book.mrp,
          book.author_royalty_per_copy,
          book.total_copies_sold || 0,
          book.total_royalty_earned || 0,
          book.royalty_paid || 0,
          book.royalty_pending || 0,
          book.last_royalty_payout_date,
          book.print_partner,
          JSON.stringify(book.available_on || [])
        ]
      );
    }
  }

  console.log(`✓ Seeded ${totalAuthors} authors and ${totalBooks} books faithfully from bookleaf_sample_data.json.`);

  // 4. Seed Representative Initial Tickets (from the assignment queries)
  const initialTickets = [
    {
      id: 'ticket-seed-001',
      ticket_number: 'TKT-2026-001',
      author_id: 'AUTH003', // Ananya Reddy
      book_id: 'BK005', // Between Two Temples (royalty pending 2546, never paid)
      subject: 'I published my book 4 months ago and still haven’t received any royalty. What’s going on?',
      description: 'My book "Between Two Temples" was published in July 2024 and 67 copies have been sold, showing accumulated royalties of ₹2,546. I have received zero payouts so far. When will my payout be transferred to my account?',
      category: 'Royalty & Payments',
      priority: 'High',
      status: 'Open',
      ai_category: 'Royalty & Payments',
      ai_priority: 'High',
      ai_category_reason: 'Inquiry relates to quarterly payout schedule and accumulated unpaid royalties above minimum ₹1,000 threshold.',
      ai_priority_reason: 'Author has accumulated unpaid royalties exceeding the ₹1,000 threshold with zero prior payouts.',
      ai_confidence: 0.95,
      assigned_to_id: adminId,
      created_at: new Date(Date.now() - 36 * 3600 * 1000) // 36 hours ago
    },
    {
      id: 'ticket-seed-002',
      ticket_number: 'TKT-2026-002',
      author_id: 'AUTH002', // Rohit Kapoor
      book_id: 'BK004', // Startup Sutra
      subject: 'My book is showing a different ISBN on Amazon than what’s on the physical copy',
      description: 'I noticed that the listing for "Startup Sutra" on Amazon India has an incorrect ISBN ending in -04-9 instead of the registered ISBN 978-93-5XXXX-04-2 printed on the book cover. Readers are getting confused.',
      category: 'ISBN & Metadata Issues',
      priority: 'Critical',
      status: 'In Progress',
      ai_category: 'ISBN & Metadata Issues',
      ai_priority: 'Critical',
      ai_category_reason: 'Issue concerns mismatch between physical book ISBN and ecommerce platform catalog registration.',
      ai_priority_reason: 'Duplicate or mismatched ISBN is a severe publication metadata issue directly impacting sales and catalog integrity.',
      ai_confidence: 0.98,
      assigned_to_id: adminId,
      created_at: new Date(Date.now() - 48 * 3600 * 1000) // 48 hours ago
    },
    {
      id: 'ticket-seed-003',
      ticket_number: 'TKT-2026-003',
      author_id: 'AUTH004', // Vikram Joshi
      book_id: 'BK006', // Debugging Life
      subject: 'I received my author copies and the print quality is terrible. The images are blurry and pages are misaligned.',
      description: 'I ordered 10 author copies of "Debugging Life" printed through the in-house Delhi printing facility. 6 of the copies have blurry chapter header illustrations and page edges are visibly cut off-center. Can I get a reprint?',
      category: 'Printing & Quality',
      priority: 'High',
      status: 'Open',
      ai_category: 'Printing & Quality',
      ai_priority: 'High',
      ai_category_reason: 'Physical defect report covering misaligned trimming and blurry print reproductions.',
      ai_priority_reason: 'Physical copy defect requires verification and reprint protocol under BookLeaf quality policy.',
      ai_confidence: 0.94,
      assigned_to_id: null,
      created_at: new Date(Date.now() - 18 * 3600 * 1000) // 18 hours ago
    },
    {
      id: 'ticket-seed-004',
      ticket_number: 'TKT-2026-004',
      author_id: 'AUTH007', // Sneha Kulkarni
      book_id: 'BK013', // Midnight in Mysore
      subject: 'It’s been 3 weeks and my book is still in typesetting. When will it be done?',
      description: 'I submitted my manuscript and approved the cover concepts for "Midnight in Mysore", but the status in the dashboard has been stuck at "In Production - Cover Design / Typesetting" for over three weeks. Please provide an update.',
      category: 'Book Status & Production Updates',
      priority: 'Medium',
      status: 'Open',
      ai_category: 'Book Status & Production Updates',
      ai_priority: 'Medium',
      ai_category_reason: 'Status inquiry regarding production timeline and typesetting progression.',
      ai_priority_reason: 'Routine production stage check; no immediate data breach or financial discrepancy.',
      ai_confidence: 0.91,
      assigned_to_id: null,
      created_at: new Date(Date.now() - 12 * 3600 * 1000) // 12 hours ago
    },
    {
      id: 'ticket-seed-005',
      ticket_number: 'TKT-2026-005',
      author_id: 'AUTH001', // Priya Sharma
      book_id: 'BK001', // Whispers of the Ganges
      subject: 'Can I update the description of my book on Amazon after it’s already live?',
      description: 'We recently got a fantastic endorsement from a well-known Indian author and would like to update the Amazon listing blurb to highlight the quote. How do I submit this update?',
      category: 'General Inquiry',
      priority: 'Low',
      status: 'Resolved',
      ai_category: 'General Inquiry',
      ai_priority: 'Low',
      ai_category_reason: 'Request for guidance on updating ecommerce blurb/metadata for an already live publication.',
      ai_priority_reason: 'Standard non-urgent informational question with established 3-5 business day workflow.',
      ai_confidence: 0.89,
      assigned_to_id: adminId,
      created_at: new Date(Date.now() - 72 * 3600 * 1000), // 3 days ago
      resolved_at: new Date(Date.now() - 24 * 3600 * 1000)
    }
  ];

  for (const t of initialTickets) {
    await query(
      `INSERT INTO tickets (
        id, ticket_number, author_id, book_id, subject, description,
        category, priority, status, ai_category, ai_priority,
        ai_category_reason, ai_priority_reason, ai_confidence,
        assigned_to_id, created_at, updated_at, resolved_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $16, $17)
      ON CONFLICT (id) DO UPDATE
      SET subject = EXCLUDED.subject,
          description = EXCLUDED.description,
          status = EXCLUDED.status,
          priority = EXCLUDED.priority,
          category = EXCLUDED.category`,
      [
        t.id,
        t.ticket_number,
        t.author_id,
        t.book_id,
        t.subject,
        t.description,
        t.category,
        t.priority,
        t.status,
        t.ai_category,
        t.ai_priority,
        t.ai_category_reason,
        t.ai_priority_reason,
        t.ai_confidence,
        t.assigned_to_id,
        t.created_at,
        t.resolved_at || null
      ]
    );
  }

  // Seed sample public messages for resolved ticket-seed-005
  await query(
    `INSERT INTO ticket_messages (id, ticket_id, sender_id, sender_role, sender_name, message, created_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     ON CONFLICT (id) DO NOTHING`,
    [
      'msg-seed-001',
      'ticket-seed-005',
      adminId,
      'admin',
      'Editorial Operations Manager',
      'Dear Priya,\n\nCongratulations on the endorsement! Yes, you can update your book description on Amazon India, Flipkart, and the BookLeaf Store at any time.\n\nPlease reply directly to this ticket with the updated description text formatted as you would like it to appear. Our distribution team will submit the catalog update to Amazon within 24 hours, and changes typically reflect on the live product page within 3–5 business days.\n\nWarm regards,\nBookLeaf Author Support Team',
      new Date(Date.now() - 24 * 3600 * 1000)
    ]
  );

  // Seed an internal note for ticket-seed-002 (mismatched ISBN)
  await query(
    `INSERT INTO internal_notes (id, ticket_id, admin_id, admin_name, content, created_at)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (id) DO NOTHING`,
    [
      'note-seed-001',
      'ticket-seed-002',
      adminId,
      'Editorial Operations Manager',
      'Internal Note: Escalated to production team (Lead: Rajesh). Repro India confirms correct ISBN is on the physical print master. Raised support case with Amazon Seller Support catalog team to update ASIN metadata. Expecting confirmation within 24h.',
      new Date(Date.now() - 30 * 3600 * 1000)
    ]
  );

  console.log('✓ Initial representative support tickets and notes seeded.');
  console.log('--- Database Seed Completed Successfully ---');
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runSeed()
    .then(() => pool.end())
    .catch((err) => {
      console.error('Seed error:', err);
      pool.end();
      process.exit(1);
    });
}
