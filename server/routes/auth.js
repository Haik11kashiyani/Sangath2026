import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import { authenticateToken, generateToken } from '../middleware/auth.js';

const router = Router();
const failedAttempts = new Map();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Check lock
    const attemptInfo = failedAttempts.get(username);
    if (attemptInfo) {
      if (attemptInfo.count >= 5 && (Date.now() - attemptInfo.lastAttempt < 15 * 60 * 1000)) {
        return res.status(423).json({ error: 'Account locked due to too many failed attempts. Try again in 15 minutes.' });
      }
      if (Date.now() - attemptInfo.lastAttempt >= 15 * 60 * 1000) {
        failedAttempts.delete(username);
      }
    }

    const resultSet = await db.execute({
      sql: 'SELECT * FROM users WHERE username = ?',
      args: [username]
    });
    const user = resultSet.rows[0];

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      const info = failedAttempts.get(username) || { count: 0, lastAttempt: Date.now() };
      info.count++;
      info.lastAttempt = Date.now();
      failedAttempts.set(username, info);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    failedAttempts.delete(username);
    
    const token = generateToken(user);
    
    const { password_hash: _password_hash, ...userInfo } = user;
    if (typeof userInfo.permissions === 'string') {
      try { userInfo.permissions = JSON.parse(userInfo.permissions); } catch(e) {}
    }
    res.json({ token, user: userInfo });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const resultSet = await db.execute({
      sql: 'SELECT * FROM users WHERE id = ?',
      args: [req.user.id]
    });
    const user = resultSet.rows[0];
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password_hash: _password_hash, ...userInfo } = user;
    if (typeof userInfo.permissions === 'string') {
      try { userInfo.permissions = JSON.parse(userInfo.permissions); } catch(e) {}
    }
    res.json(userInfo);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    const resultSet = await db.execute({
      sql: 'SELECT password_hash FROM users WHERE id = ?',
      args: [req.user.id]
    });
    const user = resultSet.rows[0];
    
    if (!user || !bcrypt.compareSync(currentPassword, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid current password' });
    }

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(newPassword, salt);
    
    await db.execute({
      sql: 'UPDATE users SET password_hash = ? WHERE id = ?',
      args: [hash, req.user.id]
    });
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
