import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../database/db.js';
import { ValidationError } from '../validators.js';

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_bookleaf_support_portal_2026_dev';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export class AuthService {
  async login({ email, password }) {
    const userRes = await query(
      `SELECT u.id, u.email, u.password_hash, u.role, u.name, u.author_id,
              a.name as author_name, a.phone, a.city, a.joined_date
       FROM users u
       LEFT JOIN authors a ON u.author_id = a.id
       WHERE LOWER(u.email) = LOWER($1)`,
      [email]
    );

    if (userRes.rows.length === 0) {
      throw new ValidationError('Invalid email or password', {
        auth: 'Incorrect credentials'
      });
    }

    const user = userRes.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new ValidationError('Invalid email or password', {
        auth: 'Incorrect credentials'
      });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      author_id: user.author_id
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        author_id: user.author_id,
        author: user.author_id
          ? {
              id: user.author_id,
              name: user.author_name || user.name,
              phone: user.phone,
              city: user.city,
              joined_date: user.joined_date
            }
          : null
      }
    };
  }

  async getCurrentUser(userId) {
    const userRes = await query(
      `SELECT u.id, u.email, u.role, u.name, u.author_id,
              a.name as author_name, a.phone, a.city, a.joined_date
       FROM users u
       LEFT JOIN authors a ON u.author_id = a.id
       WHERE u.id = $1`,
      [userId]
    );

    if (userRes.rows.length === 0) {
      throw new ValidationError('User not found');
    }

    const user = userRes.rows[0];
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      author_id: user.author_id,
      author: user.author_id
        ? {
            id: user.author_id,
            name: user.author_name || user.name,
            phone: user.phone,
            city: user.city,
            joined_date: user.joined_date
          }
        : null
    };
  }
}

export const authService = new AuthService();
