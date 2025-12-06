// src/models/userModel.js
import pool from '../config/db.js';

export const findByEmail = async (email) => {
  const { rows } = await pool.query(
    `SELECT id, name, email, phone, password_hash, created_at FROM users WHERE email = $1 AND deleted_at IS NULL`,
    [email]
  );
  return rows[0] || null;
};

export const searchUsers = async (q) => {
  const like = `%${q}%`;

  const { rows } = await pool.query(
    `
    SELECT 
      id, name, email, phone, created_at 
    FROM users
    WHERE deleted_at IS NULL
      AND (
        email ILIKE $1
        OR phone ILIKE $1
        OR name  ILIKE $1
      )
    ORDER BY name ASC
    LIMIT 20
    `,
    [like]
  );

  return rows;
};
export const createUser = async ({ name, email, phone, password_hash }) => {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, phone, password_hash)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, phone, created_at;`,
    [name, email, phone, password_hash]
  );
  return rows[0];
};

/**
 * Get enrollments (with course + instructor) for a user identified by email
 */
export const getEnrollmentsByEmail = async (email) => {
  const q = `
    SELECT
      e.id AS enrollment_id,
      e.enrolled_at,
      e.progress,
      e.status,
      e.last_accessed,
      e.completion_date,
      c.id AS course_id,
      c.title,
      c.slug,
      c.short_description,
      c.price,
      c.currency AS course_currency,
      ui.id AS instructor_id,
      ui.name AS instructor_name,
      ui.email AS instructor_email
    FROM users u
    JOIN enrollments e ON e.user_id = u.id
    JOIN courses c ON c.id = e.course_id
    LEFT JOIN users ui ON ui.id = c.instructor_id
    WHERE u.email = $1
      AND u.deleted_at IS NULL
    ORDER BY e.enrolled_at DESC
  `;
  const { rows } = await pool.query(q, [email]);
  return rows;
};
