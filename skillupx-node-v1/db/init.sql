-- db/init.sql
-- Final schema for fresh deployments of the EdTech platform (updated)
-- Run against the DB pointed to by DATABASE_URL

-- Optional extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-------------------------------------------------------------------------------
-- Users
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(30),

  password_hash TEXT NOT NULL,

  is_admin BOOLEAN DEFAULT FALSE,
  is_instructor BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-------------------------------------------------------------------------------
-- Instructors
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS instructors (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  contact_email VARCHAR(255),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_instructors_user ON instructors(user_id);

-------------------------------------------------------------------------------
-- Courses
-- NOTE: instructor_id removed (courses are not directly tied to a single instructor)
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  short_description TEXT,
  long_description TEXT,
  price NUMERIC(10,2) DEFAULT 0,
  currency CHAR(3) DEFAULT 'USD',
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_courses_title_trgm ON courses USING gin (
  to_tsvector(
    'english',
    coalesce(title,'') || ' ' || coalesce(short_description,'')
  )
);

-------------------------------------------------------------------------------
-- Lessons
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lessons (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT,
  summary TEXT,
  order_number INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_lessons_course_order ON lessons (course_id, order_number);

-------------------------------------------------------------------------------
-- Chapters
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS chapters (
  id SERIAL PRIMARY KEY,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  order_number INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_chapters_lesson_order ON chapters (lesson_id, order_number);

-------------------------------------------------------------------------------
-- Study resources
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS study_resources (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  resource_type TEXT,
  url TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_study_resources_course ON study_resources (course_id);

-------------------------------------------------------------------------------
-- Live classes
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS live_classes (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
  title TEXT,
  description TEXT,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  meeting_url TEXT,
  provider JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_live_classes_course_start ON live_classes (course_id, start_time);

-------------------------------------------------------------------------------
-- Test questions + options
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS test_questions (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  lesson_id INTEGER REFERENCES lessons(id) ON DELETE SET NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'mcq',
  points INTEGER DEFAULT 1,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_test_questions_course ON test_questions (course_id);

CREATE TABLE IF NOT EXISTS test_question_options (
  id SERIAL PRIMARY KEY,
  question_id INTEGER NOT NULL REFERENCES test_questions(id) ON DELETE CASCADE,
  option_text TEXT NOT NULL,
  is_correct BOOLEAN DEFAULT FALSE,
  order_number INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_test_question_options_question ON test_question_options (question_id);

-------------------------------------------------------------------------------
-- Purchases
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  purchase_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency CHAR(3) DEFAULT 'USD',
  purchased_at TIMESTAMPTZ DEFAULT now(),
  payment_provider TEXT,
  payment_reference TEXT,
  payment_metadata JSONB,
  status TEXT NOT NULL DEFAULT 'completed',
  refund_reference TEXT,
  access_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_purchases_user ON purchases (user_id);
CREATE INDEX IF NOT EXISTS idx_purchases_course ON purchases (course_id);

-------------------------------------------------------------------------------
-- Enrollments (NEW)
-- Links course <-> instructor <-> student, with duration and type
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS enrollments (
  id SERIAL PRIMARY KEY,
  course_id INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  instructor_id INTEGER REFERENCES instructors(id) ON DELETE SET NULL,
  student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  enrollment_duration INTERVAL, -- e.g. '30 days', '90 days'
  enrollment_type TEXT,         -- e.g. 'paid','audit','scholarship'
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- CREATE UNIQUE CONSTRAINT IF NOT SUPPORTED DIRECTLY; use conditional DO block
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_enrollments_course_student'
  ) THEN
    ALTER TABLE enrollments ADD CONSTRAINT uq_enrollments_course_student UNIQUE (course_id, student_id);
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_enrollments_course ON enrollments (course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_instructor ON enrollments (instructor_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments (student_id);

-------------------------------------------------------------------------------
-- Lesson progress
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lesson_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  lesson_id INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT now(),
  progress_percent INTEGER DEFAULT 0,
  UNIQUE (user_id, lesson_id)
);

CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress (user_id);

-------------------------------------------------------------------------------
-- Audit events
-------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_events (
  id SERIAL PRIMARY KEY,
  actor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  event_type TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-------------------------------------------------------------------------------
-- Views (updated: no course-instructor join since courses no longer store instructor_id)
-------------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_course_overview AS
SELECT
  c.id AS course_id,
  c.title,
  c.slug,
  c.short_description,
  c.price,
  c.currency,
  c.is_published,
  c.created_at
FROM courses c;

-------------------------------------------------------------------------------
-- End of init.sql
-------------------------------------------------------------------------------
