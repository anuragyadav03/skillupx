// src/routes/enrollments.js
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as enrollmentController from '../controllers/enrollmentController.js';

const router = Router();

router.get('/', [ query('limit').optional().isInt(), query('offset').optional().isInt() ], enrollmentController.listEnrollments);
router.get('/:id', [ param('id').isInt() ], enrollmentController.getEnrollment);

router.post(
  '/',
  [
    body('course_id').isInt().withMessage('course_id required'),
    body('instructor_id').optional().isInt(),
    body('student_id').optional().isInt(),
    body('student_email').optional().isEmail(),
    body('student_phone').optional(),
    body('enrollment_type').optional().isString(),
    body('enrollment_duration').optional().isString() // accept interval syntax or parse in app
  ],
  enrollmentController.createEnrollment
);

router.put('/:id', [ param('id').isInt() ], enrollmentController.updateEnrollment);
router.delete('/:id', [ param('id').isInt() ], enrollmentController.deleteEnrollment);

// helper search
router.get('/search/user', [ query('q').notEmpty() ], enrollmentController.searchUser);

export default router;
