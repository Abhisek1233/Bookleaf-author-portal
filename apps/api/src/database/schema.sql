-- BookLeaf Author Support Portal - Database Schema (PostgreSQL)

-- Authors Table
CREATE TABLE IF NOT EXISTS authors (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  city VARCHAR(100) NOT NULL,
  joined_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users Table (Authentication & RBAC)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('author', 'admin')),
  name VARCHAR(255) NOT NULL,
  author_id VARCHAR(50) UNIQUE REFERENCES authors(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Books Table
CREATE TABLE IF NOT EXISTS books (
  id VARCHAR(64) PRIMARY KEY,
  author_id VARCHAR(50) NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  isbn VARCHAR(50) NOT NULL,
  genre VARCHAR(100) NOT NULL,
  publication_date DATE,
  status VARCHAR(100) NOT NULL,
  mrp NUMERIC(10, 2),
  author_royalty_per_copy NUMERIC(10, 2),
  total_copies_sold INTEGER NOT NULL DEFAULT 0,
  total_royalty_earned NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  royalty_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  royalty_pending NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  last_royalty_payout_date DATE,
  print_partner VARCHAR(100),
  available_on JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Support Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(64) PRIMARY KEY,
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  author_id VARCHAR(50) NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
  book_id VARCHAR(64) REFERENCES books(id) ON DELETE SET NULL,
  subject VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  attachment_url TEXT,
  attachment_name VARCHAR(255),
  category VARCHAR(100) NOT NULL CHECK (category IN (
    'Royalty & Payments',
    'ISBN & Metadata Issues',
    'Printing & Quality',
    'Distribution & Availability',
    'Book Status & Production Updates',
    'General Inquiry'
  )),
  priority VARCHAR(20) NOT NULL CHECK (priority IN (
    'Critical',
    'High',
    'Medium',
    'Low'
  )),
  status VARCHAR(20) NOT NULL DEFAULT 'Open' CHECK (status IN (
    'Open',
    'In Progress',
    'Resolved',
    'Closed'
  )),
  ai_category VARCHAR(100),
  ai_priority VARCHAR(20),
  ai_category_reason TEXT,
  ai_priority_reason TEXT,
  ai_confidence NUMERIC(3, 2),
  is_category_overridden BOOLEAN NOT NULL DEFAULT FALSE,
  is_priority_overridden BOOLEAN NOT NULL DEFAULT FALSE,
  override_reason TEXT,
  assigned_to_id VARCHAR(64) REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP WITH TIME ZONE,
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Ticket Public Messages (Replies between Author and Support Ops)
CREATE TABLE IF NOT EXISTS ticket_messages (
  id VARCHAR(64) PRIMARY KEY,
  ticket_id VARCHAR(64) NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  sender_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  sender_role VARCHAR(20) NOT NULL CHECK (sender_role IN ('author', 'admin')),
  sender_name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Internal Notes (Strictly visible to Admin Ops only)
CREATE TABLE IF NOT EXISTS internal_notes (
  id VARCHAR(64) PRIMARY KEY,
  ticket_id VARCHAR(64) NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  admin_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Drafts Cache (Per-ticket editable AI draft responses)
CREATE TABLE IF NOT EXISTS ai_drafts (
  id VARCHAR(64) PRIMARY KEY,
  ticket_id VARCHAR(64) UNIQUE NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  draft_text TEXT NOT NULL,
  model_used VARCHAR(100),
  key_points JSONB DEFAULT '[]'::jsonb,
  source_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance & frequent triage queries
CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);
CREATE INDEX IF NOT EXISTS idx_tickets_author_id ON tickets(author_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_priority ON tickets(priority);
CREATE INDEX IF NOT EXISTS idx_tickets_category ON tickets(category);
CREATE INDEX IF NOT EXISTS idx_tickets_assigned_to ON tickets(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket_id ON ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_internal_notes_ticket_id ON internal_notes(ticket_id);
