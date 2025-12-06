// src/routes/lessons.js
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as lessonController from '../controllers/lessonController.js';

const router = Router();

router.post(
  '/',
  [
    body('course_id').isInt().withMessage('course_id is required and must be integer'),
    body('title').notEmpty().withMessage('title is required')
  ],
  lessonController.createLesson
);

router.get('/course/:courseId', [ param('courseId').isInt() ], lessonController.listLessonsForCourse);
router.get('/:id', [ param('id').isInt() ], lessonController.getLesson);
router.put('/:id', [ param('id').isInt() ], lessonController.updateLesson);
router.delete('/:id', [ param('id').isInt() ], lessonController.deleteLesson);

export default router;
