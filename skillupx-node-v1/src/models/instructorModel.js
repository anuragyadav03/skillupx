// src/models/instructorModel.js
import pool from '../config/db.js';

export const createInstructor = async ({ user_id = null, name, bio = null, avatar_url = null, contact_email = null, metadata = {} }) => {
  const q = `INSERT INTO instructors (user_id, name, bio, avatar_url, contact_email, metadata)
             VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`;
  const values = [user_id, name, bio, avatar_url, contact_email, metadata];
  const { rows } = await pool.query(q, values);
  return rows[0];
};

export const updateInstructor = async (id, patch) => {
  const fields = [];
  const values = [];
  let idx = 1;
  for (const [k, v] of Object.entries(patch)) {
    fields.push(`${k} = $${idx++}`);
    values.push(v);
  }
  if (fields.length === 0) return await findInstructorById(id);
  values.push(id);
  const q = `UPDATE instructors SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx} RETURNING *`;
  const { rows } = await pool.query(q, values);
  return rows[0];
};

export const findInstructorById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM instructors WHERE id = $1', [id]);
  return rows[0] || null;
};

export const listInstructors = async ({ limit = 50, offset = 0 } = {}) => {
  const { rows } = await pool.query('SELECT * FROM instructors ORDER BY created_at DESC LIMIT $1 OFFSET $2', [limit, offset]);
  return rows;
};

export const findInstructorByUserId = async (user_id) => {
  const { rows } = await pool.query('SELECT * FROM instructors WHERE user_id = $1', [user_id]);
  return rows[0] || null;
};
