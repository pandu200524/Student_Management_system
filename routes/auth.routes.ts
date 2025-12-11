import express from 'express';
import { body } from 'express-validator';
import { register, login, logout, refreshToken, getProfile } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/register', [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['admin', 'teacher', 'student'])
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], login);

router.post('/logout', authenticate, logout);
router.post('/refresh-token', refreshToken);
router.get('/profile', authenticate, getProfile);

export default router;