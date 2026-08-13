import { Router } from 'express';
import bcrypt from 'bcryptjs';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { requireRole } from '../middleware/rbac.js';

const router = Router();

router.get('/', authenticateToken, requireRole('Super Admin'), async (req, res) => {
  try {
    const resultSet = await db.execute('SELECT id, username, display_name, role, permissions, created_at, updated_at FROM users');
    res.json(resultSet.rows);
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, requireRole('Super Admin'), async (req, res) => {
  try {
    const { username, password, display_name, role } = req.body;
    
    const checkRes = await db.execute({
      sql: 'SELECT id FROM users WHERE username = ?',
      args: [username]
    });
    if (checkRes.rows.length > 0) {
      return res.status(400).json({ error: 'Username already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    
    let permissions = {};
    if (role === 'Super Admin') {
      permissions = { all: true };
    } else if (role === 'Admin') {
      permissions = { cms: { all: true }, products: { all: true }, inquiries: { all: true } };
    }

    const info = await db.execute({
      sql: 'INSERT INTO users (username, password_hash, display_name, role, permissions) VALUES (?, ?, ?, ?, ?)',
      args: [username, password_hash, display_name, role, JSON.stringify(permissions)]
    });
    
    res.status(201).json({ id: info.lastInsertRowid.toString(), message: 'User created successfully' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, requireRole('Super Admin'), async (req, res) => {
  try {
    const { role, permissions, display_name } = req.body;
    const info = await db.execute({
      sql: 'UPDATE users SET role = ?, permissions = ?, display_name = ? WHERE id = ?',
      args: [role, JSON.stringify(permissions), display_name, req.params.id]
    });
    
    if (info.rowsAffected === 0) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, requireRole('Super Admin'), async (req, res) => {
  try {
    const targetUserId = req.params.id;
    
    const targetUserRes = await db.execute({
      sql: 'SELECT role FROM users WHERE id = ?',
      args: [targetUserId]
    });
    const targetUser = targetUserRes.rows[0];
    
    if (!targetUser) return res.status(404).json({ error: 'User not found' });
    
    if (targetUser.role === 'Super Admin') {
      const countRes = await db.execute('SELECT COUNT(*) as count FROM users WHERE role = "Super Admin"');
      const count = countRes.rows[0].count;
      if (count <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last Super Admin' });
      }
    }
    
    await db.execute({
      sql: 'DELETE FROM users WHERE id = ?',
      args: [targetUserId]
    });
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
