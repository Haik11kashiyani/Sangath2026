import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const resultSet = await db.execute('SELECT page, section, content_key, content_value, content_type FROM site_content');
    const rows = resultSet.rows;
    
    const content = {};
    rows.forEach(row => {
      if (!content[row.page]) content[row.page] = {};
      
      let parsedVal = row.content_value;
      if (row.content_type === 'json' && parsedVal) {
        try { parsedVal = JSON.parse(parsedVal); } catch(e) {}
      }

      if (row.section && row.section !== 'general') {
        if (!content[row.page][row.section]) content[row.page][row.section] = {};
        content[row.page][row.section][row.content_key] = parsedVal;
      } else if (row.section === 'general') {
        if (content[row.page][row.content_key] !== undefined && typeof content[row.page][row.content_key] === 'object') {
          content[row.page][row.content_key] = parsedVal;
        } else {
          content[row.page][row.content_key] = parsedVal;
        }
      } else {
        content[row.page][row.content_key] = parsedVal;
      }
    });
    
    res.json(content);
  } catch (error) {
    console.error('Fetch content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:page', async (req, res) => {
  try {
    const resultSet = await db.execute({
      sql: 'SELECT section, content_key, content_value, content_type FROM site_content WHERE page = ?',
      args: [req.params.page]
    });
    const rows = resultSet.rows;
    
    const content = {};
    rows.forEach(row => {
      let parsedVal = row.content_value;
      if (row.content_type === 'json' && parsedVal) {
        try { parsedVal = JSON.parse(parsedVal); } catch(e) {}
      }

      if (row.section && row.section !== 'general') {
        if (!content[row.section]) content[row.section] = {};
        content[row.section][row.content_key] = parsedVal;
      } else {
        content[row.content_key] = parsedVal;
      }
    });
    
    res.json(content);
  } catch (error) {
    console.error('Fetch page content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/bulk', authenticateToken, requirePermission('cms', 'all'), async (req, res) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: 'Updates must be an array' });
    }

    const stmts = [];
    for (const update of updates) {
      const page = update.page;
      const section = update.section || 'general';
      const key = update.key || update.content_key;
      const rawVal = update.value !== undefined ? update.value : update.content_value;
      const valStr = typeof rawVal === 'object' ? JSON.stringify(rawVal) : String(rawVal ?? '');
      const typeStr = typeof rawVal === 'object' ? 'json' : 'text';
      stmts.push({
        sql: `INSERT INTO site_content (page, section, content_key, content_value, content_type, updated_by, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(page, section, content_key) DO UPDATE SET content_value = excluded.content_value, content_type = excluded.content_type, updated_by = excluded.updated_by, updated_at = CURRENT_TIMESTAMP`,
        args: [page, section, key, valStr, typeStr, req.user.id]
      });
    }
    
    await db.batch(stmts, "write");
    res.json({ message: 'Content updated successfully' });
  } catch (error) {
    console.error('Bulk update content error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
