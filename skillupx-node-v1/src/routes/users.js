import { Router } from 'express';
import { body, query } from 'express-validator';  // <-- add query here
import * as userController from '../controllers/userController.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = Router();

// Search route MUST come before /:id
router.get(
  '/search',
  authMiddleware,
  [query('q').notEmpty().withMessage('query is required')],
  userController.searchUsers
);

router.get('/:id?', authMiddleware, userController.getUser);

router.get(
  '/enrollments',
  authMiddleware,
  [query('email').isEmail().withMessage('valid email is required')],
  userController.getUserEnrollmentsByEmail
);

router.put(
  '/:id?',
  authMiddleware,
  [
    body('name').optional().isLength({ min: 1 }),
    body('email').optional().isEmail(),
    body('phone').optional().isMobilePhone('any'),
    body('password').optional().isLength({ min: 6 })
  ],
  userController.updateUser
);

router.get('/:id?/purchases', authMiddleware, userController.getUserPurchases);

export default router;
