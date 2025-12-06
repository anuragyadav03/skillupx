// src/models/enrollmentModel.js
import pool from '../config/db.js';

export const createEnrollment = async ({ client = pool, course_id, instructor_id = null, student_id, enrollment_duration = null, enrollment_type = null, metadata = {} }) => {
  const q = `
    INSERT INTO enrollments (course_id, instructor_id, student_id, enrollment_duration, enrollment_type, metadata)
    VALUES ($1,$2,$3,$4,$5,$6) RETURNING *
  `;
  const values = [course_id, instructor_id, student_id, enrollment_duration, enrollment_type, metadata];
  const { rows } = await client.query(q, values);
  return rows[0];
};

export const findEnrollmentById = async (id) => {
  const q = `SELECT * FROM enrollments WHERE id = $1`;
  const { rows } = await pool.query(q, [id]);
  return rows[0] || null;
};

export const listEnrollments = async ({ limit = 50, offset = 0 } = {}) => {
  // join with users/courses/instructors for convenience
  const q = `
    SELECT e.*, u.name as student_name, u.email as student_email, u.phone as student_phone,
           c.title as course_title, i.name as instructor_name
    FROM enrollments e
    JOIN users u ON u.id = e.student_id
    JOIN courses c ON c.id = e.course_id
    LEFT JOIN instructors i ON i.id = e.instructor_id
    ORDER BY e.enrolled_at DESC
    LIMIT $1 OFFSET $2
  `;
  const { rows } = await pool.query(q, [limit, offset]);
  return rows;
};

export const deleteEnrollment = async (id) => {
  const q = `DELETE FROM enrollments WHERE id = $1 RETURNING *`;
  const { rows } = await pool.query(q, [id]);
  return rows[0] || null;
};

export const updateEnrollment = async (id, patch) => {
  const fields = [];
  const vals = [];
  let idx = 1;
  for (const [k, v] of Object.entries(patch)) {
    if (typeof v === 'undefined') continue;
    fields.push(`${k} = $${idx++}`);
    vals.push(v);
  }
  if (fields.length === 0) return await findEnrollmentById(id);
  vals.push(id);
  const q = `UPDATE enrollments SET ${fields.join(', ')}, updated_at = now() WHERE id = $${idx} RETURNING *`;
  const { rows } = await pool.query(q, vals);
  return rows[0] || null;
};
