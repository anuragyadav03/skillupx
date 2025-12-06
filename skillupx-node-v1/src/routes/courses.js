// src/routes/courses.js
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as courseController from '../controllers/courseController.js';

const router = Router();

router.post(
  '/',
  [
    body('title').notEmpty().withMessage('title is required'),
    body('price').optional().isNumeric().withMessage('price must be numeric'),
    body('instructor_id').optional().isInt().withMessage('instructor_id must be integer')
  ],
  courseController.createCourse
);

router.get('/', [ query('limit').optional().isInt(), query('offset').optional().isInt(), query('published').optional().isBoolean() ], courseController.listCourses);
router.get('/:id', [ param('id').isInt() ], courseController.getCourse);
router.put('/:id', [ param('id').isInt() ], courseController.updateCourse);
router.delete('/:id', [ param('id').isInt() ], courseController.deleteCourse);

export default router;
