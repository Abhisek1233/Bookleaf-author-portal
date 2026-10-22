import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from './constants.js';

export class ValidationError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
    this.details = details;
  }
}

export function validateLogin(data) {
  const errors = {};
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid request body');
  }

  const email = (data.email || '').trim();
  const password = data.password || '';

  if (!email) {
    errors.email = 'Email address is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please provide a valid email address';
  }

  if (!password) {
    errors.password = 'Password is required';
  } else if (password.length < 6) {
    errors.password = 'Password must be at least 6 characters';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  return { email, password };
}

export function validateCreateTicket(data) {
  const errors = {};
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid request body');
  }

  const subject = (data.subject || '').trim();
  const description = (data.description || '').trim();
  const book_id = data.book_id ? String(data.book_id).trim() : null;
  const attachment_url = data.attachment_url ? String(data.attachment_url).trim() : null;
  const attachment_name = data.attachment_name ? String(data.attachment_name).trim() : null;

  if (!subject) {
    errors.subject = 'Subject is required';
  } else if (subject.length < 5) {
    errors.subject = 'Subject must be at least 5 characters long';
  } else if (subject.length > 200) {
    errors.subject = 'Subject cannot exceed 200 characters';
  }

  if (!description) {
    errors.description = 'Description is required';
  } else if (description.length < 15) {
    errors.description = 'Please provide a detailed query (at least 15 characters)';
  } else if (description.length > 4000) {
    errors.description = 'Description cannot exceed 4000 characters';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  return { subject, description, book_id, attachment_url, attachment_name };
}

export function validateUpdateStatus(data) {
  if (!data || !TICKET_STATUSES.includes(data.status)) {
    throw new ValidationError(`Invalid status. Allowed values: ${TICKET_STATUSES.join(', ')}`);
  }
  return { status: data.status };
}

export function validateOverride(data) {
  const errors = {};
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid request body');
  }

  if (!data.category || !TICKET_CATEGORIES.includes(data.category)) {
    errors.category = `Invalid category. Allowed values: ${TICKET_CATEGORIES.join(', ')}`;
  }

  if (!data.priority || !TICKET_PRIORITIES.includes(data.priority)) {
    errors.priority = `Invalid priority. Allowed values: ${TICKET_PRIORITIES.join(', ')}`;
  }

  const override_reason = data.override_reason ? String(data.override_reason).trim() : null;

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Validation failed', errors);
  }

  return { category: data.category, priority: data.priority, override_reason };
}

export function validateAssign(data) {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid request body');
  }
  const admin_id = data.admin_id ? String(data.admin_id).trim() : null;
  return { admin_id };
}

export function validateInternalNote(data) {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid request body');
  }
  const content = (data.content || '').trim();
  if (!content) {
    throw new ValidationError('Note content is required');
  }
  if (content.length < 3) {
    throw new ValidationError('Note must be at least 3 characters');
  }
  if (content.length > 3000) {
    throw new ValidationError('Note cannot exceed 3000 characters');
  }
  return { content };
}

export function validatePublicReply(data) {
  if (!data || typeof data !== 'object') {
    throw new ValidationError('Invalid request body');
  }
  const message = (data.message || '').trim();
  if (!message) {
    throw new ValidationError('Reply message is required');
  }
  if (message.length < 2) {
    throw new ValidationError('Reply must be at least 2 characters');
  }
  if (message.length > 5000) {
    throw new ValidationError('Reply cannot exceed 5000 characters');
  }
  return { message };
}

export function validateAiClassification(data) {
  if (!data || typeof data !== 'object') return null;

  const category = TICKET_CATEGORIES.includes(data.category) ? data.category : 'General Inquiry';
  const priority = TICKET_PRIORITIES.includes(data.priority) ? data.priority : 'Medium';
  const category_reason = typeof data.category_reason === 'string' ? data.category_reason.slice(0, 500) : 'Standard inquiry classification';
  const priority_reason = typeof data.priority_reason === 'string' ? data.priority_reason.slice(0, 500) : 'Standard inquiry assessment';
  const confidence = typeof data.confidence === 'number' && data.confidence >= 0 && data.confidence <= 1 ? data.confidence : 0.85;

  return { category, priority, category_reason, priority_reason, confidence };
}
