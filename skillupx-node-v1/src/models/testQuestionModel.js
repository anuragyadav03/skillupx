import pool from '../config/db.js';

export const createTestQuestion = async ({
  course_id,
  lesson_id,
  question_text,
  question_type = "mcq",
  points = 1,
  metadata = {}
}) => {

  const q = `
    INSERT INTO test_questions 
    (course_id, lesson_id, question_text, question_type, points, metadata)
    VALUES ($1,$2,$3,$4,$5,$6)
    RETURNING *
  `;

  const values = [
    course_id, lesson_id, question_text,
    question_type, points, metadata
  ];

  const { rows } = await pool.query(q, values);
  return rows[0];
};

export const listTestQuestions = async (lesson_id) => {
  const { rows } = await pool.query(
    "SELECT * FROM test_questions WHERE lesson_id = $1 AND deleted_at IS NULL",
    [lesson_id]
  );
  return rows;
};

export const findTestQuestionById = async (id) => {
  const { rows } = await pool.query(
    "SELECT * FROM test_questions WHERE id = $1 AND deleted_at IS NULL",
    [id]
  );
  return rows[0] || null;
};

export const softDeleteTestQuestion = async (id) => {
  const { rows } = await pool.query(
    "UPDATE test_questions SET deleted_at = now() WHERE id = $1 RETURNING *",
    [id]
  );
  return rows[0] || null;
};
