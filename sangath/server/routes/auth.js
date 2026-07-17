import express from 'express';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';
import { generateToken, generateRefreshToken, hashToken } from '../middleware/auth.js';

const router = express.Router();

// Helper to set refresh cookie
const setRefreshCookie = (res, token) => {
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge,
  });
};

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const result = await query('SELECT * FROM admin_users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const admin = result.rows[0];
    if (admin.status === 'locked') return res.status(403).json({ error: 'Account locked' });

    const validPassword = await bcryptjs.compare(password, admin.password_hash);
    if (!validPassword) {
      await query('UPDATE admin_users SET failed_login_attempts = failed_login_attempts + 1 WHERE id = $1', [admin.id]);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateToken(admin.id, admin.email, admin.role);
    const refreshToken = generateRefreshToken(admin.id);
    const tokenHash = hashToken(refreshToken);
    const userAgent = req.get('User-Agent') || null;
    const ip = req.ip || req.connection?.remoteAddress || null;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    await query(
      'INSERT INTO refresh_tokens (admin_id, token_hash, user_agent, ip_address, expires_at) VALUES ($1, $2, $3, $4, $5)',
      [admin.id, tokenHash, userAgent, ip, expiresAt]
    );

    await query('UPDATE admin_users SET last_login = NOW(), failed_login_attempts = 0 WHERE id = $1', [admin.id]);

    setRefreshCookie(res, refreshToken);

    res.json({
      token: accessToken,
      admin: { id: admin.id, email: admin.email, role: admin.role },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken || req.headers['x-refresh-token'];
    if (!refreshToken) return res.status(401).json({ error: 'No refresh token provided' });

    let payload;
    try {
      payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const tokenHash = hashToken(refreshToken);
    const rows = await query('SELECT * FROM refresh_tokens WHERE token_hash = $1 AND is_revoked = false AND expires_at > NOW()', [tokenHash]);
    if (rows.rows.length === 0) return res.status(401).json({ error: 'Refresh token not found or revoked' });

    const oldRow = rows.rows[0];

    // Rotate: revoke old token and insert new one
    await query('UPDATE refresh_tokens SET is_revoked = true WHERE id = $1', [oldRow.id]);

    const newRefreshToken = generateRefreshToken(payload.id);
    const newHash = hashToken(newRefreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const userAgent = req.get('User-Agent') || null;
    const ip = req.ip || req.connection?.remoteAddress || null;

    await query('INSERT INTO refresh_tokens (admin_id, token_hash, user_agent, ip_address, expires_at) VALUES ($1, $2, $3, $4, $5)', [payload.id, newHash, userAgent, ip, expiresAt]);

    const userResult = await query('SELECT id, email, role FROM admin_users WHERE id = $1', [payload.id]);
    const user = userResult.rows[0];

    const accessToken = generateToken(user.id, user.email, user.role);
    setRefreshCookie(res, newRefreshToken);

    res.json({ token: accessToken });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Refresh failed' });
  }
});

router.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken || req.headers['x-refresh-token'];
    if (refreshToken) {
      const tokenHash = hashToken(refreshToken);
      await query('UPDATE refresh_tokens SET is_revoked = true WHERE token_hash = $1', [tokenHash]);
    }

    res.clearCookie('refreshToken');
    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
