// src/controllers/userController.js
import { validationResult } from 'express-validator';
import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import * as userModel from '../models/userModel.js'; // <-- important import
import 'dotenv/config';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10);

/**
 * Helper: resolve user id from params or req.user (set by auth middleware)
 */
const resolveUserId = (req) => {
  const paramId = req.params.id ? Number(req.params.id) : null;
  const authId = req.user?.id ? Number(req.user.id) : null;
  return paramId || authId;
};

/**
 * GET /api/users/:id?  — fetch user safe details
 * If :id not provided, uses authenticated user (req.user.id).
 */
export const getUser = async (req, res, next) => {
  try {
    const id = resolveUserId(req);
    if (!id) return res.status(400).json({ message: 'User id not specified' });

    const q = `SELECT id, name, email, phone, is_admin, is_instructor, created_at, updated_at FROM users WHERE id = $1 AND deleted_at IS NULL`;
    const { rows } = await pool.query(q, [id]);
    const user = rows[0];
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.json({ user });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/users/:id?  — update user details
 * Body may contain: name, email, phone, password
 * - only the authenticated user may update their record (unless you allow admins)
 * - if email changed, ensure uniqueness
 * - if password provided, hash it
 */
export const updateUser = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const id = resolveUserId(req);
    if (!id) return res.status(400).json({ message: 'User id not specified' });

    // Authorization: ensure requester is the same user (or admin)
    if (req.user && Number(req.user.id) !== id && !req.user.is_admin) {
      return res.status(403).json({ message: 'Forbidden: cannot update other user' });
    }

    const { name, email, phone, password } = req.body || {};

    // Nothing to update
    if (name === undefined && email === undefined && phone === undefined && password === undefined) {
      return res.status(400).json({ message: 'No fields to update' });
    }

    await client.query('BEGIN');

    // If email change requested, ensure it's unique
    if (email) {
      const dup = await client.query('SELECT id FROM users WHERE email = $1 AND id <> $2', [email, id]);
      if (dup.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ message: 'Email already in use' });
      }
    }

    // Build update
    const sets = [];
    const vals = [];
    let idx = 1;

    if (name !== undefined) {
      sets.push(`name = $${idx++}`);
      vals.push(name);
    }
    if (email !== undefined) {
      sets.push(`email = $${idx++}`);
      vals.push(email);
    }
    if (phone !== undefined) {
      sets.push(`phone = $${idx++}`);
      vals.push(phone);
    }
    if (password !== undefined) {
      const hash = await bcrypt.hash(password, SALT_ROUNDS);
      sets.push(`password_hash = $${idx++}`);
      vals.push(hash);
    }

    if (sets.length > 0) {
      vals.push(id);
      const q = `UPDATE users SET ${sets.join(', ')}, updated_at = now() WHERE id = $${idx} RETURNING id, name, email, phone, is_admin, is_instructor, created_at, updated_at`;
      const { rows } = await client.query(q, vals);
      if (rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'User not found' });
      }
      await client.query('COMMIT');
      return res.json({ user: rows[0] });
    } else {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'No valid fields to update' });
    }
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (e) { /* ignore */ }
    next(err);
  } finally {
    client.release();
  }
};

/**
 * GET /api/users/:id?/purchases - fetch courses bought by user
 * Returns purchase details plus course summary.
 */
export const getUserPurchases = async (req, res, next) => {
  try {
    const id = resolveUserId(req);
    if (!id) return res.status(400).json({ message: 'User id not specified' });

    const q = `
      SELECT
        p.id AS purchase_id,
        p.purchase_price,
        p.currency,
        p.purchased_at,
        p.payment_provider,
        p.payment_reference,
        p.status,
        c.id AS course_id,
        c.title AS course_title,
        c.slug AS course_slug,
        c.short_description AS course_short_description,
        c.price AS course_price,
        c.currency AS course_currency
      FROM purchases p
      JOIN courses c ON c.id = p.course_id
      WHERE p.user_id = $1
      ORDER BY p.purchased_at DESC
    `;
    const { rows } = await pool.query(q, [id]);
    return res.json({ purchases: rows });
  } catch (err) {
    next(err);
  }
};

/**
 * SEARCH USERS
 * GET /api/users/search?q=term
 */
export const searchUsers = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const q = (req.query.q || '').toString().trim();
    if (!q || q.length < 2) return res.json({ users: [] });

    // delegate to model (uses ILIKE and parameterized query)
    const users = await userModel.searchUsers(q);
    return res.json({ users });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/users/enrollments?email=someone@example.com
 * Returns a list of enrollments for the user identified by email.
 * Only the user themself or an admin may run this.
 */
export const getUserEnrollmentsByEmail = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const email = (req.query.email || '').toString().trim().toLowerCase();
    if (!email) return res.status(400).json({ message: 'Email is required' });

    // Authorization: allow if requester is admin or is the same email
    if (!req.user) return res.status(401).json({ message: 'Authentication required' });
    const requesterIsAdmin = Boolean(req.user.is_admin);
    const requesterEmail = (req.user.email || '').toString().toLowerCase();

    if (!requesterIsAdmin && requesterEmail !== email) {
      return res.status(403).json({ message: 'Forbidden: cannot access other user enrollments' });
    }

    const rows = await userModel.getEnrollmentsByEmail(email);

    // Transform rows into nested structure per enrollment (if necessary)
    const enrollments = rows.map(r => ({
      enrollment_id: r.enrollment_id,
      enrolled_at: r.enrolled_at,
      progress: r.progress,
      status: r.status,
      last_accessed: r.last_accessed,
      completion_date: r.completion_date,
      // course summary
      course: {
        id: r.course_id,
        title: r.title,
        slug: r.slug,
        short_description: r.short_description,
        price: r.price,
        currency: r.course_currency
      },
      // instructor summary
      instructor: {
        id: r.instructor_id,
        name: r.instructor_name,
        email: r.instructor_email
      }
    }));

    return res.json({ enrollments });
  } catch (err) {
    next(err);
  }
};
