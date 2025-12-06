// src/models/courseModel.js
import pool from '../config/db.js';

/**
 * Create a course.
 * Note: courses table no longer contains instructor_id.
 */
export const createCourse = async ({ title, slug = null, short_description = null, long_description = null, price = 0, currency = 'USD', is_published = false }) => {
  const q = `INSERT INTO courses (title, slug, short_description, long_description, price, currency, is_published)
             VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`;
  const values = [title, slug, short_description, long_description, price, currency, is_published];
  const { rows } = await pool.query(q, values);
  return rows[0];
};

/**
 * Update a course by id. patch is an object with fields to update.
 * Any attempt to update instructor_id will be ignored (schema no longer has it).
 */
export const updateCourse = async (id, patch) => {
  // defensive: do not allow instructor_id in patch (schema change)
  if ('instructor_id' in patch) {
    delete patch.instructor_id;
  }

  const fields = [];
  const values = [];
  let idx = 1;
  for (const [k, v] of Object.entries(patch)) {
    // skip undefined values
    if (typeof v === 'undefined') continue;
    fields.push(`${k} = $${idx++}`);
    values.push(v);
  }

  if (fields.length === 0) {
    return await findCourseById(id);
  }

  values.push(id);
  const q = `UPDATE courses SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx} RETURNING *`;
  const { rows } = await pool.query(q, values);
  return rows[0] || null;
};

export const findCourseById = async (id) => {
  const { rows } = await pool.query('SELECT * FROM courses WHERE id = $1 AND deleted_at IS NULL', [id]);
  return rows[0] || null;
};

export const listCourses = async ({ limit = 20, offset = 0, publishedOnly = false } = {}) => {
  const q = publishedOnly
    ? 'SELECT * FROM courses WHERE deleted_at IS NULL AND is_published = TRUE ORDER BY created_at DESC LIMIT $1 OFFSET $2'
    : 'SELECT * FROM courses WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT $1 OFFSET $2';
  const values = [limit, offset];
  const { rows } = await pool.query(q, values);
  return rows;
};

export const softDeleteCourse = async (id) => {
  const { rows } = await pool.query('UPDATE courses SET deleted_at = now() WHERE id = $1 RETURNING *', [id]);
  return rows[0] || null;
};
