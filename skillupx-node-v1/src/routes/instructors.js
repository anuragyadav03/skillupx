// src/routes/instructors.js
import { Router } from 'express';
import { body, param, query } from 'express-validator';
import * as instructorController from '../controllers/instructorController.js';

const router = Router();

router.post(
  '/',
  [
    body('name').notEmpty().withMessage('name is required'),
    body('user_id').optional().isInt().withMessage('user_id must be integer')
  ],
  instructorController.createInstructor
);

router.get('/', [ query('limit').optional().isInt(), query('offset').optional().isInt() ], instructorController.listInstructors);
router.get('/:id', [ param('id').isInt() ], instructorController.getInstructor);
router.put('/:id', [ param('id').isInt() ], instructorController.updateInstructor);

export default router;
