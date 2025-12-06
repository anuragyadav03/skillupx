// src/models/chapterModel.js
import pool from '../config/db.js';

/* -------------------------------------------------------
   CREATE CHAPTER
------------------------------------------------------- */
export const createChapter = async ({
  lesson_id,
  title,
  content_type,
  video_url = null,
  resource_path = null,
  test_questions = 0,
  chapter_name = null,
  timed = false,
  active = true
}) => {

  // VALIDATION rules
  if (content_type === "VIDEO") {
    resource_path = null;
    test_questions = 0;
    if (!video_url)
      throw new Error("VIDEO chapters must include video_url");
  }

  if (content_type === "RESOURCE") {
    video_url = null;
    test_questions = 0;
    if (!resource_path)
      throw new Error("RESOURCE chapters must include resource_path");
  }

  if (content_type === "TEST") {
    video_url = null;
    resource_path = null;
    if (!test_questions || test_questions <= 0)
      throw new Error("TEST chapters must include test_questions (>=1)");
  }


  const q = `
    INSERT INTO chapters 
    (lesson_id, title, content_type, video_url, resource_path, 
     test_questions, chapter_name, timed, active)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
  `;

  const values = [
    lesson_id,
    title,
    content_type,
    video_url,
    resource_path,
    test_questions,
    chapter_name,
    timed,
    active
  ];

  const { rows } = await pool.query(q, values);
  return rows[0];
};


/* -------------------------------------------------------
   UPDATE CHAPTER
------------------------------------------------------- */
export const updateChapter = async (id, patch) => {
  const chapterBefore = await findChapterById(id);
  if (!chapterBefore) return null;

  const updated = { ...chapterBefore, ...patch };

  // VALIDATION
  if (updated.content_type === "VIDEO") {
    updated.resource_path = null;
    updated.test_questions = 0;
    if (!updated.video_url)
      throw new Error("VIDEO chapters must include video_url");
  }

  if (updated.content_type === "RESOURCE") {
    updated.video_url = null;
    updated.test_questions = 0;
    if (!updated.resource_path)
      throw new Error("RESOURCE chapters must include resource_path");
  }

  if (updated.content_type === "TEST") {
    updated.video_url = null;
    updated.resource_path = null;
    if (!updated.test_questions || updated.test_questions <= 0)
      throw new Error("TEST chapters must include test_questions (>=1)");
  }

  // BUILD UPDATE SQL
  const fields = [];
  const values = [];
  let idx = 1;

  for (const [key, val] of Object.entries(updated)) {
    if (key === "id" || key === "created_at") continue;

    fields.push(`${key} = $${idx++}`);
    values.push(val);
  }

  const q = `
    UPDATE chapters
    SET ${fields.join(', ')}, updated_at = now()
    WHERE id = $${idx}
    RETURNING *
  `;

  values.push(id);

  const { rows } = await pool.query(q, values);
  return rows[0];
};


/* -------------------------------------------------------
   FIND CHAPTER
------------------------------------------------------- */
export const findChapterById = async (id) => {
  const { rows } = await pool.query(
    'SELECT * FROM chapters WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};


/* -------------------------------------------------------
   LIST CHAPTERS for a lesson
------------------------------------------------------- */
export const fetchAllChaptersByLessonId = async (lesson_id, { limit = 100, offset = 0 } = {}) => {
  const { rows } = await pool.query(
    `
    SELECT * FROM chapters
    WHERE lesson_id = $1
    ORDER BY id ASC
    LIMIT $2 OFFSET $3
    `,
    [lesson_id, limit, offset]
  );

  return rows;
};


/* -------------------------------------------------------
   SOFT DELETE
------------------------------------------------------- */
export const softDeleteChapter = async (id) => {
  const { rows } = await pool.query(
    `
    UPDATE chapters 
    SET active = FALSE, updated_at = now()
    WHERE id = $1
    RETURNING *
    `,
    [id]
  );
  return rows[0] || null;
};
