// src/controllers/instructorController.js
import { validationResult } from 'express-validator';
import * as instructorModel from '../models/instructorModel.js';
import bcrypt from 'bcrypt';
import 'dotenv/config';
import pool from '../config/db.js';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10);

/**
 * Create instructor:
 * - If user with contact_email exists:
 *     - if already an instructor -> 409
 *     - else -> create instructor row linked to existing user (ignore password)
 * - If user doesn't exist:
 *     - password is required -> create user (hash password) -> create instructor linked to new user
 *
 * All in a transaction.
 */
export const createInstructor = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      name,
      contact_email,
      phone = null,
      password, // required only if user does not already exist
      bio = null,
      avatar_url = null,
      metadata = {}
    } = req.body;

    if (!name || !contact_email) {
      return res.status(400).json({ message: 'name and contact_email are required' });
    }

    await client.query('BEGIN');

    // 1) find user by email
    const userRes = await client.query('SELECT * FROM users WHERE email = $1', [contact_email]);
    let user = userRes.rows[0];

    if (!user) {
      // user doesn't exist -> password required
      if (!password) {
        await client.query('ROLLBACK');
        return res.status(400).json({ message: 'Password is required for new user creation' });
      }

      const password_hash = await bcrypt.hash(password, SALT_ROUNDS);

      const insertUserQ = `
        INSERT INTO users (name, email, phone, password_hash)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, email, phone, created_at
      `;
      const insertUserV = [name, contact_email, phone, password_hash];
      const createdUserRes = await client.query(insertUserQ, insertUserV);
      user = createdUserRes.rows[0];
    } else {
      // user exists - we do NOT change password here.
      // Optionally: verify provided password before linking - not implemented.
    }

    // 2) ensure user is not already an instructor
    const instrCheck = await client.query('SELECT * FROM instructors WHERE user_id = $1', [user.id]);
    if (instrCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'An instructor already exists for this user/email' });
    }

    // 3) create instructor linked to user.id
    const insertInstrQ = `
      INSERT INTO instructors (user_id, name, bio, avatar_url, contact_email, metadata)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const insertInstrV = [user.id, name, bio, avatar_url, contact_email, metadata];
    const instrRes = await client.query(insertInstrQ, insertInstrV);
    const instructor = instrRes.rows[0];

    await client.query('COMMIT');

    // return 201 with both created/linked resources
    return res.status(201).json({ instructor, user });
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (e) { /* ignore rollback error */ }
    next(err);
  } finally {
    client.release();
  }
};

/**
 * Update instructor (and optionally its linked user).
 * Behavior:
 *  - Accepts patch for instructor fields and user fields:
 *      instructor fields: name, bio, avatar_url, metadata, contact_email
 *      user fields: name, phone, email (contact_email), password
 *  - If changing email, ensures new email isn't used by another user (409).
 *  - If password provided, hashes it and updates users.password_hash.
 *  - All in a transaction; returns updated { instructor, user }.
 */
export const updateInstructor = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid instructor id' });

    const patch = req.body || {};

    await client.query('BEGIN');

    // 1) load existing instructor
    const instrRes = await client.query('SELECT * FROM instructors WHERE id = $1', [id]);
    const existingInstr = instrRes.rows[0];
    if (!existingInstr) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Instructor not found' });
    }

    const userId = existingInstr.user_id;

    // 2) If email change requested (contact_email or patch.email), ensure uniqueness
    const newEmail = patch.contact_email ?? patch.email ?? null;
    if (newEmail && newEmail !== existingInstr.contact_email) {
      const dupe = await client.query('SELECT id FROM users WHERE email = $1 AND id <> $2', [newEmail, userId]);
      if (dupe.rows.length > 0) {
        await client.query('ROLLBACK');
        return res.status(409).json({ message: 'Email already in use by another account' });
      }
    }

    // 3) Update users table if relevant fields provided: name, phone, email, password
    const userFields = {};
    if (patch.name !== undefined) userFields.name = patch.name;
    if (patch.phone !== undefined) userFields.phone = patch.phone;
    if (newEmail) userFields.email = newEmail;
    if (patch.password) {
      userFields.password_hash = await bcrypt.hash(patch.password, SALT_ROUNDS);
    }

    if (Object.keys(userFields).length > 0) {
      const sets = [];
      const vals = [];
      let idx = 1;
      for (const [k, v] of Object.entries(userFields)) {
        sets.push(`${k} = $${idx++}`);
        vals.push(v);
      }
      vals.push(userId);
      const q = `UPDATE users SET ${sets.join(', ')}, updated_at = now() WHERE id = $${idx} RETURNING id, name, email, phone, created_at, updated_at`;
      const updatedUserRes = await client.query(q, vals);
      // if no rows then user missing unexpectedly
      if (updatedUserRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(500).json({ message: 'Failed to update linked user' });
      }
    }

    // 4) Update instructors table with instructor-related fields
    const instrPatch = {};
    if (patch.name !== undefined) instrPatch.name = patch.name;
    if (patch.bio !== undefined) instrPatch.bio = patch.bio;
    if (patch.avatar_url !== undefined) instrPatch.avatar_url = patch.avatar_url;
    if (patch.metadata !== undefined) instrPatch.metadata = patch.metadata;
    // contact_email on instructors is a copy; if provided, set it
    if (patch.contact_email !== undefined) instrPatch.contact_email = patch.contact_email;

    let updatedInstructor = existingInstr;
    if (Object.keys(instrPatch).length > 0) {
      const fields = [];
      const vals = [];
      let idx = 1;
      for (const [k, v] of Object.entries(instrPatch)) {
        fields.push(`${k} = $${idx++}`);
        vals.push(v);
      }
      vals.push(id);
      const q = `UPDATE instructors SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx} RETURNING *`;
      const updatedInstrRes = await client.query(q, vals);
      if (updatedInstrRes.rows.length > 0) updatedInstructor = updatedInstrRes.rows[0];
    }

    // 5) fetch current user
    const userFetch = await client.query('SELECT id, name, email, phone, created_at, updated_at FROM users WHERE id = $1', [userId]);
    const user = userFetch.rows[0] || null;

    await client.query('COMMIT');

    return res.json({ instructor: updatedInstructor, user });
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (e) { /* ignore */ }
    next(err);
  } finally {
    client.release();
  }
};

/**
 * Get instructor by id, including linked user (safe fields).
 */
export const getInstructor = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ message: 'Invalid instructor id' });

    const instr = await instructorModel.findInstructorById(id);
    if (!instr) return res.status(404).json({ message: 'Instructor not found' });

    // fetch linked user safe fields
    const userRes = await pool.query('SELECT id, name, email, phone, created_at, updated_at FROM users WHERE id = $1', [instr.user_id]);
    const user = userRes.rows[0] || null;

    return res.json({ instructor: instr, user });
  } catch (err) {
    next(err);
  }
};

/**
 * List instructors (optionally paginated). Includes linked user email/name for convenience.
 */
export const listInstructors = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;

    // join instructors with users to show basic user info
    const q = `
      SELECT i.*, u.email AS user_email, u.name AS user_name, u.phone AS user_phone
      FROM instructors i
      LEFT JOIN users u ON u.id = i.user_id
      ORDER BY i.created_at DESC
      LIMIT $1 OFFSET $2
    `;
    const { rows } = await pool.query(q, [limit, offset]);

    return res.json({ instructors: rows });
  } catch (err) {
    next(err);
  }
};
