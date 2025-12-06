// src/controllers/enrollmentController.js
import { validationResult } from 'express-validator';
import pool from '../config/db.js';
import * as enrollmentModel from '../models/enrollmentModel.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

const SALT_ROUNDS = Number(process.env.SALT_ROUNDS || 10);

/**
 * Helper: find user by email or phone
 */
const findUserByEmail = async (client, email) => {
  const res = await client.query('SELECT * FROM users WHERE email = $1', [email]);
  return res.rows[0] || null;
};
const findUserByPhone = async (client, phone) => {
  const res = await client.query('SELECT * FROM users WHERE phone = $1', [phone]);
  return res.rows[0] || null;
};

/**
 * Create enrollment:
 * - If student_id provided => use it
 * - Else if student email/phone provided, try to find existing user
 * - Else create a new user on the fly (generate random password hash)
 *
 * All creation happens inside a transaction.
 */
export const createEnrollment = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const {
      course_id,
      instructor_id = null,
      student_id = null,
      student_email = null,
      student_phone = null,
      student_name = null,
      enrollment_duration = null,
      enrollment_type = null,
      metadata = {}
    } = req.body;

    if (!course_id) return res.status(400).json({ message: 'course_id is required' });

    await client.query('BEGIN');

    let student = null;

    if (student_id) {
      const u = await client.query('SELECT * FROM users WHERE id = $1', [student_id]);
      if (!u.rows.length) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'student_id not found' });
      }
      student = u.rows[0];
    } else {
      // try find by email or phone
      if (student_email) student = await findUserByEmail(client, student_email);
      if (!student && student_phone) student = await findUserByPhone(client, student_phone);

      if (!student) {
        // create user on the fly - need password_hash (generate random)
        const randomPassword = crypto.randomBytes(12).toString('hex');
        const password_hash = await bcrypt.hash(randomPassword, SALT_ROUNDS);

        // Use provided name/email/phone where available
        const nameToUse = student_name || student_email || student_phone || 'Student';
        const insertQ = `
          INSERT INTO users (name, email, phone, password_hash)
          VALUES ($1,$2,$3,$4) RETURNING id, name, email, phone, created_at
        `;
        const insertV = [nameToUse, student_email || null, student_phone || null, password_hash];
        const created = await client.query(insertQ, insertV);
        student = created.rows[0];
      }
    }

    // create enrollment
    const enrollment = await enrollmentModel.createEnrollment({
      client,
      course_id,
      instructor_id,
      student_id: student.id,
      enrollment_duration,
      enrollment_type,
      metadata
    });

    await client.query('COMMIT');

    // return enrollment with student info
    return res.status(201).json({ enrollment: { ...enrollment, student } });
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (e) {}
    next(err);
  } finally {
    client.release();
  }
};

export const listEnrollments = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 50;
    const offset = Number(req.query.offset) || 0;
    const rows = await enrollmentModel.listEnrollments({ limit, offset });
    return res.json({ enrollments: rows });
  } catch (err) {
    next(err);
  }
};

export const getEnrollment = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const enrollment = await enrollmentModel.findEnrollmentById(id);
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    // fetch student/course/instructor summary
    const studentQ = await pool.query('SELECT id,name,email,phone FROM users WHERE id = $1', [enrollment.student_id]);
    const courseQ = await pool.query('SELECT id,title,slug FROM courses WHERE id = $1', [enrollment.course_id]);
    const instrQ = await pool.query('SELECT id,name,contact_email FROM instructors WHERE id = $1', [enrollment.instructor_id]);
    return res.json({
      enrollment,
      student: studentQ.rows[0] || null,
      course: courseQ.rows[0] || null,
      instructor: instrQ.rows[0] || null
    });
  } catch (err) {
    next(err);
  }
};

export const updateEnrollment = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const patch = req.body;
    const enrollment = await enrollmentModel.updateEnrollment(id, patch);
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    return res.json({ enrollment });
  } catch (err) {
    next(err);
  }
};

export const deleteEnrollment = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const enrollment = await enrollmentModel.deleteEnrollment(id);
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });
    return res.json({ enrollment });
  } catch (err) {
    next(err);
  }
};

/**
 * Helper endpoints: search user by email or phone (for frontend lookup)
 */
export const searchUser = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    if (!q) return res.json({ users: [] });
    const { rows } = await pool.query(
      `SELECT id, name, email, phone FROM users WHERE email = $1 OR phone = $2 LIMIT 10`,
      [q, q]
    );
    return res.json({ users: rows });
  } catch (err) {
    next(err);
  }
};
