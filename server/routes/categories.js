import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission, requireRole } from '../middleware/rbac.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const resultSet = await db.execute(`
      SELECT c.*, COUNT(p.id) as productCount
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE c.is_active = 1
      GROUP BY c.id
      ORDER BY c.sort_order ASC, c.id ASC
    `);
    // Convert BigInt to number if count is BigInt
    const categories = resultSet.rows.map(row => {
      const count = typeof row.productCount === 'bigint' ? Number(row.productCount) : row.productCount;
      return { ...row, productCount: count };
    });
    res.json(categories);
  } catch (error) {
    console.error('Fetch categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, requirePermission('products', 'categories', 'all'), async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const info = await db.execute({
      sql: 'INSERT INTO categories (slug, name, description, image) VALUES (?, ?, ?, ?)',
      args: [slug, name, description || '', image || '']
    });
    
    res.status(201).json({ id: info.lastInsertRowid.toString(), slug, message: 'Category created' });
  } catch (error) {
    console.error('Create category error:', error);
    if (error.message?.includes('UNIQUE constraint failed') || error.code === 'SQLITE_CONSTRAINT') {
      return res.status(400).json({ error: 'Category with this slug/name already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, requirePermission('products', 'categories', 'all'), async (req, res) => {
  try {
    const { name, description, image } = req.body;
    const catId = req.params.id;

    // Check if ID is integer or slug
    const findRes = await db.execute({
      sql: 'SELECT id FROM categories WHERE id = ? OR slug = ?',
      args: [catId, catId]
    });
    const existing = findRes.rows[0];
    if (!existing) return res.status(404).json({ error: 'Category not found' });

    await db.execute({
      sql: 'UPDATE categories SET name = ?, description = ?, image = ? WHERE id = ?',
      args: [name, description || '', image || '', existing.id]
    });
    
    res.json({ message: 'Category updated' });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, requireRole('Super Admin'), async (req, res) => {
  try {
    const catId = req.params.id;
    const findRes = await db.execute({
      sql: 'SELECT id FROM categories WHERE id = ? OR slug = ?',
      args: [catId, catId]
    });
    const existing = findRes.rows[0];
    if (!existing) return res.status(404).json({ error: 'Category not found' });

    const countRes = await db.execute({
      sql: 'SELECT COUNT(*) as count FROM products WHERE category_id = ?',
      args: [existing.id]
    });
    const count = typeof countRes.rows[0].count === 'bigint' ? Number(countRes.rows[0].count) : countRes.rows[0].count;
    
    if (count > 0) {
      return res.status(400).json({ error: 'Cannot delete category with associated products' });
    }
    
    await db.execute({
      sql: 'DELETE FROM categories WHERE id = ?',
      args: [existing.id]
    });
    
    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
