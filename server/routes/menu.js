import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';

const router = Router();

// GET /api/menu - Get all menu items as a nested tree
router.get('/', async (req, res) => {
  try {
    const resultSet = await db.execute('SELECT * FROM menu_items ORDER BY sort_order ASC');
    const rows = resultSet.rows;

    // Build the tree
    const menuMap = {};
    const rootItems = [];

    // First pass: initialize map and items
    rows.forEach(row => {
      menuMap[row.id] = { ...row, children: [] };
    });

    // Second pass: attach children to parents
    rows.forEach(row => {
      if (row.parent_id && menuMap[row.parent_id]) {
        menuMap[row.parent_id].children.push(menuMap[row.id]);
      } else {
        rootItems.push(menuMap[row.id]);
      }
    });

    res.json(rootItems);
  } catch (error) {
    console.error('Fetch menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/menu - Create a new menu item
router.post('/', authenticateToken, requirePermission('cms', 'all'), async (req, res) => {
  try {
    const { parent_id, label, page, external_url, icon, is_visible } = req.body;
    
    // LibSQL / Turso doesn't support complex nested subqueries in INSERT easily if they reference the same table sometimes, but let's try the standard way.
    // If it fails, we can calculate sort_order first.
    
    // Better to calculate sort order manually to avoid SQLite limitations on Turso
    const pId = parent_id || null;
    let maxSortOrder = 0;
    if (pId) {
      const sortRes = await db.execute({ sql: 'SELECT MAX(sort_order) as maxSort FROM menu_items WHERE parent_id = ?', args: [pId] });
      maxSortOrder = sortRes.rows[0]?.maxSort || 0;
    } else {
      const sortRes = await db.execute('SELECT MAX(sort_order) as maxSort FROM menu_items WHERE parent_id IS NULL');
      maxSortOrder = sortRes.rows[0]?.maxSort || 0;
    }
    const sort_order = (typeof maxSortOrder === 'bigint' ? Number(maxSortOrder) : maxSortOrder) + 1;

    const info = await db.execute({
      sql: `INSERT INTO menu_items (parent_id, label, page, external_url, icon, sort_order, is_visible) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        pId, 
        label || '', 
        page || '', 
        external_url || '', 
        icon || '', 
        sort_order,
        is_visible !== undefined ? is_visible : 1
      ]
    });
    
    res.json({ id: info.lastInsertRowid.toString(), message: 'Menu item created successfully' });
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/menu/reorder - Bulk reorder menu items
router.put('/reorder', authenticateToken, requirePermission('cms', 'all'), async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, sort_order, parent_id }
    
    if (!Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid items format' });
    }

    const stmts = [];
    for (const item of items) {
      stmts.push({
        sql: 'UPDATE menu_items SET sort_order = ?, parent_id = ? WHERE id = ?',
        args: [item.sort_order, item.parent_id || null, item.id]
      });
    }
    
    if (stmts.length > 0) {
      await db.batch(stmts, "write");
    }
    
    res.json({ message: 'Menu order updated successfully' });
  } catch (error) {
    console.error('Reorder menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/menu/:id - Update a menu item
router.put('/:id', authenticateToken, requirePermission('cms', 'all'), async (req, res) => {
  try {
    const { label, page, external_url, icon, is_visible } = req.body;
    
    await db.execute({
      sql: `UPDATE menu_items SET label = ?, page = ?, external_url = ?, icon = ?, is_visible = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      args: [label, page || '', external_url || '', icon || '', is_visible, req.params.id]
    });
    
    res.json({ message: 'Menu item updated successfully' });
  } catch (error) {
    console.error('Update menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/menu/:id - Delete a menu item
router.delete('/:id', authenticateToken, requirePermission('cms', 'all'), async (req, res) => {
  try {
    await db.execute({
      sql: 'DELETE FROM menu_items WHERE id = ?',
      args: [req.params.id]
    });
    // ON DELETE CASCADE will handle removing child items in SQLite if enabled
    res.json({ message: 'Menu item deleted successfully' });
  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
