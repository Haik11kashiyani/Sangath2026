import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission, requireRole } from '../middleware/rbac.js';
import { sanitize } from '../middleware/validate.js';
import fs from 'fs';
import path from 'path';

const router = Router();

router.get('/', authenticateToken, requirePermission('inquiries', 'all'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM inquiries';
    let countQuery = 'SELECT COUNT(*) as total FROM inquiries';
    let params = [];
    
    if (search) {
      const searchParam = `%${search}%`;
      query += ' WHERE name LIKE ? OR email LIKE ? OR message LIKE ?';
      countQuery += ' WHERE name LIKE ? OR email LIKE ? OR message LIKE ?';
      params.push(searchParam, searchParam, searchParam);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    
    let countParams = search ? params.slice(0, 3) : [];
    let itemsParams = [...params, limit, offset];

    const totalRes = await db.execute({ sql: countQuery, args: countParams });
    const total = typeof totalRes.rows[0].total === 'bigint' ? Number(totalRes.rows[0].total) : totalRes.rows[0].total;

    const itemsRes = await db.execute({ sql: query, args: itemsParams });
    const items = itemsRes.rows;

    res.json({ items, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    console.error('Fetch inquiries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', (req, res, next) => {
  // Apply sanitize middleware manually since we need it on fields
  req.body.name = sanitize(req.body.name);
  req.body.email = sanitize(req.body.email);
  req.body.phone = sanitize(req.body.phone);
  req.body.company = sanitize(req.body.company);
  req.body.subject = sanitize(req.body.subject);
  req.body.message = sanitize(req.body.message);
  next();
}, async (req, res) => {
  try {
    const { name, email, phone, company, subject, message } = req.body;
    
    const info = await db.execute({
      sql: 'INSERT INTO inquiries (name, email, phone, company, subject, message) VALUES (?, ?, ?, ?, ?, ?)',
      args: [name, email, phone, company, subject, message]
    });
    
    res.status(201).json({ id: info.lastInsertRowid.toString(), message: 'Inquiry submitted successfully' });
  } catch (error) {
    console.error('Create inquiry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id/status', authenticateToken, requirePermission('inquiries', 'all'), async (req, res) => {
  try {
    const { status } = req.body;
    if (!['new', 'read', 'replied', 'archived'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const info = await db.execute({
      sql: 'UPDATE inquiries SET status = ? WHERE id = ?',
      args: [status, req.params.id]
    });
    
    if (info.rowsAffected === 0) return res.status(404).json({ error: 'Inquiry not found' });
    res.json({ message: 'Status updated' });
  } catch (error) {
    console.error('Update inquiry status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, requireRole('Super Admin'), async (req, res) => {
  try {
    const info = await db.execute({
      sql: 'DELETE FROM inquiries WHERE id = ?',
      args: [req.params.id]
    });
    
    if (info.rowsAffected === 0) return res.status(404).json({ error: 'Inquiry not found' });
    res.json({ message: 'Inquiry deleted' });
  } catch (error) {
    console.error('Delete inquiry error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/export/csv', authenticateToken, requirePermission('inquiries', 'all'), async (req, res) => {
  try {
    const itemsRes = await db.execute('SELECT * FROM inquiries ORDER BY created_at DESC');
    const items = itemsRes.rows;
    
    if (items.length === 0) {
      return res.status(404).json({ error: 'No data to export' });
    }
    
    const headers = Object.keys(items[0]).join(',');
    const rows = items.map(item => 
      Object.values(item).map(val => `"${(val || '').toString().replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="inquiries.csv"');
    res.send(csv);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
