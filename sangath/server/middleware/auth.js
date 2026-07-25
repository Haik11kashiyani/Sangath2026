import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const secret = process.env.JWT_SECRET || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
    const decoded = jwt.verify(token, secret);
    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const generateToken = (adminId, adminEmail, role) => {
  const secret = process.env.JWT_SECRET || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const expiry = process.env.JWT_EXPIRY || '24h';
  return jwt.sign(
    { id: adminId, email: adminEmail, role },
    secret,
    { expiresIn: expiry }
  );
};

export const generateRefreshToken = (adminId) => {
  const secret = process.env.JWT_REFRESH_SECRET || 'fedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210';
  return jwt.sign(
    { id: adminId },
    secret,
    { expiresIn: '7d' }
  );
};
