import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

let ioInstance = null;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_bookleaf_support_portal_2026_dev';

export function initializeSocket(httpServer) {
  ioInstance = new Server(httpServer, {
    cors: {
      origin: (origin, callback) => callback(null, true),
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Socket Authentication Middleware
  ioInstance.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) {
      return next(new Error('Authentication token required'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded; // { id, email, role, name, author_id }
      next();
    } catch (err) {
      next(new Error('Invalid or expired socket token'));
    }
  });

  ioInstance.on('connection', (socket) => {
    const { role, author_id, email } = socket.user;
    // console.log(`[Socket] User connected: ${email} (${role})`);

    // Admins join the global operations room
    if (role === 'admin') {
      socket.join('admin_ops');
    }

    // Authors join their private author channel
    if (role === 'author' && author_id) {
      socket.join(`author:${author_id}`);
    }

    // Allow joining a specific ticket room for live messaging
    socket.on('ticket:join', (ticketId) => {
      socket.join(`ticket:${ticketId}`);
    });

    socket.on('ticket:leave', (ticketId) => {
      socket.leave(`ticket:${ticketId}`);
    });

    socket.on('disconnect', () => {
      // console.log(`[Socket] Disconnected: ${email}`);
    });
  });

  return ioInstance;
}

export function getIO() {
  return ioInstance;
}

/**
 * Broadcast ticket creation to author room and admin room
 */
export function emitTicketCreated(ticket) {
  if (!ioInstance) return;
  ioInstance.to(`author:${ticket.author_id}`).emit('ticket:created', ticket);
  ioInstance.to('admin_ops').emit('ticket:created', ticket);
}

/**
 * Broadcast ticket updates (status change, reassignment, priority/category override)
 */
export function emitTicketUpdated(ticket) {
  if (!ioInstance) return;
  ioInstance.to(`ticket:${ticket.id}`).emit('ticket:updated', ticket);
  ioInstance.to(`author:${ticket.author_id}`).emit('ticket:updated', ticket);
  ioInstance.to('admin_ops').emit('ticket:updated', ticket);
}

/**
 * Broadcast a public response message
 */
export function emitTicketMessage(ticketId, authorId, message) {
  if (!ioInstance) return;
  ioInstance.to(`ticket:${ticketId}`).emit('ticket:message', message);
  ioInstance.to(`author:${authorId}`).emit('ticket:message', message);
  ioInstance.to('admin_ops').emit('ticket:message', message);
}

/**
 * Broadcast an internal note: STRICTLY ADMIN OPS ONLY!
 */
export function emitInternalNote(ticketId, note) {
  if (!ioInstance) return;
  ioInstance.to('admin_ops').emit('ticket:note', { ticket_id: ticketId, note });
}
