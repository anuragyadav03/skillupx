-- db/drop_all.sql
-- DANGER: Drops ALL tables, views, and constraints created by the EdTech schema.
-- Safe for local/dev resets. Review before running in production.

BEGIN;

-- Drop views first
DROP VIEW IF EXISTS vw_course_overview CASCADE;

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS audit_events CASCADE;
DROP TABLE IF EXISTS lesson_progress CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS test_question_options CASCADE;
DROP TABLE IF EXISTS test_questions CASCADE;
DROP TABLE IF EXISTS live_classes CASCADE;
DROP TABLE IF EXISTS study_resources CASCADE;
DROP TABLE IF EXISTS chapters CASCADE;
DROP TABLE IF EXISTS lessons CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS instructors CASCADE;
DROP TABLE IF EXISTS users CASCADE;

COMMIT;

-- Extensions (optional to drop)
-- DROP EXTENSION IF EXISTS "pg_trgm";
