course -> lessons -> chapters uses cascading deletes (delete a course → lessons and chapters removed). If you prefer soft-delete-only flows, remove ON DELETE CASCADE and rely on deleted_at.

study_resources and live_classes both reference course_id and optionally lesson_id. If a resource is course-wide, leave lesson_id NULL.

test_questions stored in its own table; test_question_options holds MCQ options and is_correct booleans. For multi-select keep multiple options is_correct = true.

purchases stores payment metadata in JSONB to avoid schema lock-ins with external providers.

I added lesson_progress so you can easily track progress and resume functionality.

Use created_at/updated_at timestamps in all tables. You should update updated_at in your app queries when performing updates (or use trigger to auto-update).





