import express from 'express';
import bcryptjs from 'bcryptjs';
import { query } from '../config/database.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await query('SELECT * FROM admin_users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const admin = result.rows[0];

    if (admin.status === 'locked') {
      return res.status(403).json({ error: 'Account locked' });
    }

    const validPassword = await bcryptjs.compare(password, admin.password_hash);
    
    if (!validPassword) {
      await query('UPDATE admin_users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1', [admin.id]);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(admin.id, admin.email, admin.role);
    
    await query(
      'UPDATE admin_users SET last_login = NOW(), failed_login_attempts = 0 WHERE id = $1',
      [admin.id]
    );

    res.json({ 
      token, 
      admin: { 
        id: admin.id, 
        email: admin.email, 
        role: admin.role 
      } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
