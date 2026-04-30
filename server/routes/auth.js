import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, sanitizeUser } from '../db/queries.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required.' });
    }

    const user = findUserByEmail(email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid credentials.' });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: sanitizeUser(user),
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.post('/logout', (_req, res) => {
  return res.json({ success: true, message: 'Logout successful.' });
});

router.get('/me', verifyToken, (req, res) => {
  return res.json({
    success: true,
    user: sanitizeUser(req.user),
  });
});

export default router;
