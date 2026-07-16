import express from 'express';
import { verifyToken } from '../middleware/auth.js';
import { checkPermission } from '../middleware/rbac.js';
import { query } from '../config/database.js';

const router = express.Router();

router.use(verifyToken);

// Pages
router.get('/pages', checkPermission(['view_content']), async (req, res) => {
  try {
    const result = await query('SELECT * FROM pages ORDER BY slug');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching pages:', error);
    res.status(500).json({ error: 'Failed to fetch pages' });
  }
});

router.put('/pages/:slug', checkPermission(['edit_content']), async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content, meta_description } = req.body;
    
    await query(
      'UPDATE pages SET title = $1, content = $2, meta_description = $3, updated_at = NOW() WHERE slug = $4',
      [title, content, meta_description, slug]
    );

    res.json({ success: true, message: 'Page updated' });
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Failed to update page' });
  }
});

// Products
router.get('/products', checkPermission(['view_content']), async (req, res) => {
  try {
    const result = await query('SELECT * FROM products WHERE is_active = true ORDER BY display_order');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.post('/products', checkPermission(['create_content']), async (req, res) => {
  try {
    const { name, description, price, category_id, image_url, details } = req.body;
    const result = await query(
      'INSERT INTO products (name, description, price, category_id, image_url, details) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, description, price, category_id, image_url, JSON.stringify(details || {})]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/products/:id', checkPermission(['edit_content']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image_url, details } = req.body;
    
    await query(
      'UPDATE products SET name = $1, description = $2, price = $3, image_url = $4, details = $5, updated_at = NOW() WHERE id = $6',
      [name, description, price, image_url, JSON.stringify(details || {}), id]
    );

    res.json({ success: true, message: 'Product updated' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.delete('/products/:id', checkPermission(['delete_content']), async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Social Media
router.get('/social-media', checkPermission(['view_content']), async (req, res) => {
  try {
    const result = await query('SELECT * FROM social_media WHERE is_active = true ORDER BY display_order');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching social media:', error);
    res.status(500).json({ error: 'Failed to fetch social media' });
  }
});

router.put('/social-media/:id', checkPermission(['edit_content']), async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, url, icon_url } = req.body;
    
    await query(
      'UPDATE social_media SET platform = $1, url = $2, icon_url = $3, updated_at = NOW() WHERE id = $4',
      [platform, url, icon_url, id]
    );

    res.json({ success: true, message: 'Social media updated' });
  } catch (error) {
    console.error('Error updating social media:', error);
    res.status(500).json({ error: 'Failed to update social media' });
  }
});

// Settings
router.get('/settings', async (req, res) => {
  try {
    const result = await query('SELECT key, value FROM site_settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

router.put('/settings/:key', checkPermission(['edit_content']), async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    await query(
      'INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
      [key, JSON.stringify(value)]
    );

    res.json({ success: true, message: 'Setting updated' });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
});

// Contact Submissions
router.get('/contact-submissions', checkPermission(['view_content']), async (req, res) => {
  try {
    const result = await query('SELECT * FROM contact_submissions ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Failed to fetch submissions' });
  }
});

router.put('/contact-submissions/:id/reply', checkPermission(['edit_content']), async (req, res) => {
  try {
    const { id } = req.params;
    const { reply_message } = req.body;
    
    await query(
      'UPDATE contact_submissions SET reply_message = $1, status = $2, replied_by = $3, updated_at = NOW() WHERE id = $4',
      [reply_message, 'replied', req.admin.id, id]
    );

    res.json({ success: true, message: 'Reply sent' });
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

// Audit Logs
router.get('/audit-logs', checkPermission(['view_audit']), async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
