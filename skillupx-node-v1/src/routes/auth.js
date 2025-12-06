// src/routes/auth.js
import { Router } from 'express';
import { body } from 'express-validator';
import * as authController from '../controllers/authController.js';

const router = Router();

router.post(
  '/signup',
  [
    body('name').isLength({ min: 1 }).withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('phone').optional().isMobilePhone('any').withMessage('Invalid phone')
  ],
  authController.signup
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').exists().withMessage('Password is required')
  ],
  authController.login
);

export default router;
