import express from 'express';
import bcryptjs from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { verifyToken } from '../middleware/auth.js';
import { checkPermission } from '../middleware/rbac.js';
import { query } from '../config/database.js';

const router = express.Router();

const auditLog = async (adminId, action, resourceType, resourceId, oldValues, newValues, ipAddress) => {
  try {
    await query(
      `INSERT INTO audit_logs (admin_id, action, resource_type, resource_id, old_values, new_values, ip_address)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [adminId, action, resourceType, resourceId, oldValues ? JSON.stringify(oldValues) : null, newValues ? JSON.stringify(newValues) : null, ipAddress]
    );
  } catch (error) {
    console.error('Audit log failed', error);
  }
};

const slugify = (text) => text.toString().toLowerCase().trim().replace(/[\s\W-]+/g, '-');

router.use(verifyToken);

// Dashboard
router.get('/dashboard/stats', checkPermission(['view_content']), async (req, res) => {
  try {
    const productsRes = await query('SELECT COUNT(*) FROM products');
    const categoriesRes = await query('SELECT COUNT(*) FROM categories');
    const pagesRes = await query('SELECT COUNT(*) FROM pages');
    const usersRes = await query('SELECT COUNT(*) FROM admin_users');
    const subRes = await query('SELECT COUNT(*) as total, SUM(CASE WHEN status = \'new\' THEN 1 ELSE 0 END) as new, SUM(CASE WHEN status = \'replied\' THEN 1 ELSE 0 END) as replied FROM contact_submissions');
    const auditRes = await query(`
      SELECT a.*, u.email as admin_email 
      FROM audit_logs a 
      LEFT JOIN admin_users u ON a.admin_id = u.id 
      ORDER BY a.created_at DESC LIMIT 10
    `);

    res.json({
      products: parseInt(productsRes.rows[0].count),
      categories: parseInt(categoriesRes.rows[0].count),
      pages: parseInt(pagesRes.rows[0].count),
      users: parseInt(usersRes.rows[0].count),
      submissions: {
        total: parseInt(subRes.rows[0].total || 0),
        new: parseInt(subRes.rows[0].new || 0),
        replied: parseInt(subRes.rows[0].replied || 0)
      },
      recentActivity: auditRes.rows
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// Categories
router.get('/categories', checkPermission(['view_content']), async (req, res) => {
  try {
    const result = await query(`
      SELECT c.*, COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.display_order ASC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

router.post('/categories', checkPermission(['create_content']), async (req, res) => {
  try {
    const { name, description, display_order } = req.body;
    const slug = slugify(name);
    
    const result = await query(
      'INSERT INTO categories (name, slug, description, display_order) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, slug, description, display_order || 0]
    );

    await auditLog(req.admin.id, 'create', 'category', result.rows[0].id, null, result.rows[0], req.ip || req.connection?.remoteAddress);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
});

router.put('/categories/:id', checkPermission(['edit_content']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, display_order } = req.body;
    const slug = slugify(name);
    
    const result = await query(
      'UPDATE categories SET name = $1, slug = $2, description = $3, display_order = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [name, slug, description, display_order, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });

    await auditLog(req.admin.id, 'update', 'category', id, null, result.rows[0], req.ip || req.connection?.remoteAddress);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/categories/:id', checkPermission(['delete_content']), async (req, res) => {
  try {
    const { id } = req.params;
    
    const countRes = await query('SELECT COUNT(*) FROM products WHERE category_id = $1', [id]);
    if (parseInt(countRes.rows[0].count) > 0) {
      return res.status(409).json({ error: 'Cannot delete category with linked products' });
    }

    const result = await query('DELETE FROM categories WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Category not found' });

    await auditLog(req.admin.id, 'delete', 'category', id, result.rows[0], null, req.ip || req.connection?.remoteAddress);
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

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

router.post('/pages', checkPermission(['create_content']), async (req, res) => {
  try {
    const { slug, title, content, meta_description, meta_keywords, is_published } = req.body;
    
    const result = await query(
      'INSERT INTO pages (slug, title, content, meta_description, meta_keywords, is_published) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [slug, title, content, meta_description, meta_keywords, is_published]
    );

    await auditLog(req.admin.id, 'create', 'page', result.rows[0].id, null, result.rows[0], req.ip || req.connection?.remoteAddress);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating page:', error);
    res.status(500).json({ error: 'Failed to create page' });
  }
});

router.put('/pages/:slug', checkPermission(['edit_content']), async (req, res) => {
  try {
    const { slug } = req.params;
    const { title, content, meta_description, meta_keywords, is_published } = req.body;
    
    const result = await query(
      'UPDATE pages SET title = $1, content = $2, meta_description = $3, meta_keywords = $4, is_published = $5, updated_at = NOW() WHERE slug = $6 RETURNING *',
      [title, content, meta_description, meta_keywords, is_published, slug]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Page not found' });
    
    await auditLog(req.admin.id, 'update', 'page', result.rows[0].id, null, result.rows[0], req.ip || req.connection?.remoteAddress);
    res.json({ success: true, message: 'Page updated', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating page:', error);
    res.status(500).json({ error: 'Failed to update page' });
  }
});

router.delete('/pages/:slug', checkPermission(['delete_content']), async (req, res) => {
  try {
    const { slug } = req.params;
    const result = await query('DELETE FROM pages WHERE slug = $1 RETURNING *', [slug]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Page not found' });
    
    await auditLog(req.admin.id, 'delete', 'page', result.rows[0].id, result.rows[0], null, req.ip || req.connection?.remoteAddress);
    res.json({ success: true, message: 'Page deleted' });
  } catch (error) {
    console.error('Error deleting page:', error);
    res.status(500).json({ error: 'Failed to delete page' });
  }
});

// Products
router.get('/products', checkPermission(['view_content']), async (req, res) => {
  try {
    const { category_id, search, is_active } = req.query;
    
    let sql = 'SELECT * FROM products WHERE 1=1';
    let params = [];
    let pIdx = 1;

    if (category_id) {
      sql += ` AND category_id = $${pIdx++}`;
      params.push(category_id);
    }
    
    if (search) {
      sql += ` AND (name ILIKE $${pIdx} OR description ILIKE $${pIdx})`;
      params.push(`%${search}%`);
      pIdx++;
    }
    
    if (is_active !== undefined) {
      sql += ` AND is_active = $${pIdx++}`;
      params.push(is_active === 'true');
    }
    
    sql += ' ORDER BY display_order ASC';
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

router.get('/products/:id', checkPermission(['view_content']), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

router.post('/products', checkPermission(['create_content']), async (req, res) => {
  try {
    const { name, description, price, category_id, image_url, details, specifications, featured, is_active, display_order } = req.body;
    
    let category_slug = null;
    let category_name = null;
    if (category_id) {
      const catRes = await query('SELECT slug, name FROM categories WHERE id = $1', [category_id]);
      if (catRes.rows.length > 0) {
        category_slug = catRes.rows[0].slug;
        category_name = catRes.rows[0].name;
      }
    }

    const result = await query(
      `INSERT INTO products (name, description, price, category_id, category_slug, category_name, image_url, details, specifications, featured, is_active, display_order) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [name, description, price, category_id, category_slug, category_name, image_url, JSON.stringify(details || {}), JSON.stringify(specifications || {}), featured || false, is_active !== false, display_order || 0]
    );
    
    await auditLog(req.admin.id, 'create', 'product', result.rows[0].id, null, result.rows[0], req.ip || req.connection?.remoteAddress);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Failed to create product' });
  }
});

router.put('/products/:id', checkPermission(['edit_content']), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, image_url, details, specifications, category_id, featured, is_active, display_order } = req.body;
    
    let category_slug = null;
    let category_name = null;
    if (category_id) {
      const catRes = await query('SELECT slug, name FROM categories WHERE id = $1', [category_id]);
      if (catRes.rows.length > 0) {
        category_slug = catRes.rows[0].slug;
        category_name = catRes.rows[0].name;
      }
    }

    const result = await query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, image_url = $4, details = $5, specifications = $6, category_id = $7, category_slug = $8, category_name = $9, featured = $10, is_active = $11, display_order = $12, updated_at = NOW() 
       WHERE id = $13 RETURNING *`,
      [name, description, price, image_url, JSON.stringify(details || {}), JSON.stringify(specifications || {}), category_id, category_slug, category_name, featured, is_active, display_order, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });

    await auditLog(req.admin.id, 'update', 'product', id, null, result.rows[0], req.ip || req.connection?.remoteAddress);
    res.json({ success: true, message: 'Product updated', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: 'Failed to update product' });
  }
});

router.patch('/products/:id/toggle', checkPermission(['edit_content']), async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    const result = await query('UPDATE products SET is_active = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [is_active, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    
    await auditLog(req.admin.id, 'toggle_active', 'product', id, null, { is_active }, req.ip || req.connection?.remoteAddress);
    res.json({ success: true, is_active: result.rows[0].is_active });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle product' });
  }
});

router.patch('/products/:id/feature', checkPermission(['edit_content']), async (req, res) => {
  try {
    const { id } = req.params;
    const { featured } = req.body;
    
    const result = await query('UPDATE products SET featured = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [featured, id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    
    await auditLog(req.admin.id, 'toggle_feature', 'product', id, null, { featured }, req.ip || req.connection?.remoteAddress);
    res.json({ success: true, featured: result.rows[0].featured });
  } catch (error) {
    res.status(500).json({ error: 'Failed to toggle featured status' });
  }
});

router.delete('/products/:id', checkPermission(['delete_content']), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Product not found' });
    
    await auditLog(req.admin.id, 'delete', 'product', id, result.rows[0], null, req.ip || req.connection?.remoteAddress);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// Admin Users
router.get('/users', checkPermission(['manage_users', 'view_users']), async (req, res) => {
  try {
    const result = await query('SELECT id, email, role, status, last_login, created_at FROM admin_users ORDER BY email');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching admin users:', error);
    res.status(500).json({ error: 'Failed to fetch admin users' });
  }
});

router.post('/users', checkPermission(['manage_users']), async (req, res) => {
  try {
    const { email, password, role = 'editor', status = 'active' } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const password_hash = bcryptjs.hashSync(password, 12);
    const id = uuidv4();

    const result = await query(
      'INSERT INTO admin_users (id, email, password_hash, role, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, email, role, status, last_login, created_at',
      [id, email, password_hash, role, status]
    );

    await auditLog(req.admin.id, 'create', 'admin_user', result.rows[0].id, null, { email, role, status }, req.ip || req.connection?.remoteAddress);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Admin user with this email already exists' });
    }
    console.error('Error creating admin user:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
});

router.put('/users/:id', checkPermission(['manage_users']), async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role, status } = req.body;
    const existing = await query('SELECT id, email, role, status FROM admin_users WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    const oldValues = existing.rows[0];
    const updatedEmail = email || oldValues.email;
    const updatedRole = role || oldValues.role;
    const updatedStatus = status || oldValues.status;

    await query(
      'UPDATE admin_users SET email = $1, role = $2, status = $3, updated_at = NOW() WHERE id = $4',
      [updatedEmail, updatedRole, updatedStatus, id]
    );

    await auditLog(req.admin.id, 'update', 'admin_user', id, oldValues, { email: updatedEmail, role: updatedRole, status: updatedStatus }, req.ip || req.connection?.remoteAddress);

    res.json({ success: true, message: 'Admin user updated' });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'Email address is already in use' });
    }
    console.error('Error updating admin user:', error);
    res.status(500).json({ error: 'Failed to update admin user' });
  }
});

router.put('/users/:id/password', checkPermission(['manage_users']), async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required' });
    }

    const existing = await query('SELECT id, email FROM admin_users WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    const password_hash = bcryptjs.hashSync(password, 12);
    await query('UPDATE admin_users SET password_hash = $1, password_changed_at = NOW(), updated_at = NOW() WHERE id = $2', [password_hash, id]);

    await auditLog(req.admin.id, 'reset_password', 'admin_user', id, null, { email: existing.rows[0].email }, req.ip || req.connection?.remoteAddress);

    res.json({ success: true, message: 'Password updated' });
  } catch (error) {
    console.error('Error updating admin password:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

router.delete('/users/:id', checkPermission(['manage_users']), async (req, res) => {
  try {
    const { id } = req.params;
    if (req.admin.id === id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    const existing = await query('SELECT id, email FROM admin_users WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Admin user not found' });
    }

    await query('DELETE FROM admin_users WHERE id = $1', [id]);
    await auditLog(req.admin.id, 'delete', 'admin_user', id, { email: existing.rows[0].email }, null, req.ip || req.connection?.remoteAddress);

    res.json({ success: true, message: 'Admin user deleted' });
  } catch (error) {
    console.error('Error deleting admin user:', error);
    res.status(500).json({ error: 'Failed to delete admin user' });
  }
});

// Social Media
router.get('/social-media', checkPermission(['view_content']), async (req, res) => {
  try {
    const result = await query('SELECT * FROM social_media ORDER BY display_order');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching social media:', error);
    res.status(500).json({ error: 'Failed to fetch social media' });
  }
});

router.post('/social-media', checkPermission(['create_content']), async (req, res) => {
  try {
    const { platform, url, icon_url, display_order, is_active } = req.body;
    const result = await query(
      'INSERT INTO social_media (platform, url, icon_url, display_order, is_active) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [platform, url, icon_url, display_order || 0, is_active !== false]
    );
    await auditLog(req.admin.id, 'create', 'social_media', result.rows[0].id, null, result.rows[0], req.ip || req.connection?.remoteAddress);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating social media:', error);
    res.status(500).json({ error: 'Failed to create social media' });
  }
});

router.put('/social-media/:id', checkPermission(['edit_content']), async (req, res) => {
  try {
    const { id } = req.params;
    const { platform, url, icon_url, display_order, is_active } = req.body;
    
    const result = await query(
      'UPDATE social_media SET platform = $1, url = $2, icon_url = $3, display_order = $4, is_active = $5, updated_at = NOW() WHERE id = $6 RETURNING *',
      [platform, url, icon_url, display_order, is_active, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Social media not found' });
    await auditLog(req.admin.id, 'update', 'social_media', id, null, result.rows[0], req.ip || req.connection?.remoteAddress);

    res.json({ success: true, message: 'Social media updated', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating social media:', error);
    res.status(500).json({ error: 'Failed to update social media' });
  }
});

router.delete('/social-media/:id', checkPermission(['delete_content']), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM social_media WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Social media not found' });
    await auditLog(req.admin.id, 'delete', 'social_media', id, result.rows[0], null, req.ip || req.connection?.remoteAddress);

    res.json({ success: true, message: 'Social media deleted' });
  } catch (error) {
    console.error('Error deleting social media:', error);
    res.status(500).json({ error: 'Failed to delete social media' });
  }
});

// Settings
router.get('/settings', checkPermission(['view_content']), async (req, res) => {
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

router.put('/settings', checkPermission(['edit_content']), async (req, res) => {
  try {
    const settings = req.body;
    for (const [key, value] of Object.entries(settings)) {
      await query(
        'INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
        [key, JSON.stringify(value)]
      );
    }
    await auditLog(req.admin.id, 'update_bulk', 'settings', null, null, settings, req.ip || req.connection?.remoteAddress);
    res.json({ success: true, message: 'Settings updated' });
  } catch (error) {
    console.error('Error updating bulk settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

router.put('/settings/:key', checkPermission(['edit_content']), async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    await query(
      'INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()',
      [key, JSON.stringify(value)]
    );

    await auditLog(req.admin.id, 'update', 'setting', key, null, value, req.ip || req.connection?.remoteAddress);
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
    
    const result = await query(
      'UPDATE contact_submissions SET reply_message = $1, status = $2, replied_by = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [reply_message, 'replied', req.admin.id, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Submission not found' });
    await auditLog(req.admin.id, 'reply', 'contact_submission', id, null, { reply_message }, req.ip || req.connection?.remoteAddress);

    res.json({ success: true, message: 'Reply sent' });
  } catch (error) {
    console.error('Error sending reply:', error);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

router.put('/contact-submissions/:id/status', checkPermission(['edit_content']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const result = await query(
      'UPDATE contact_submissions SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Submission not found' });
    await auditLog(req.admin.id, 'update_status', 'contact_submission', id, null, { status }, req.ip || req.connection?.remoteAddress);

    res.json({ success: true, message: 'Status updated' });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

router.delete('/contact-submissions/:id', checkPermission(['delete_content']), async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM contact_submissions WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) return res.status(404).json({ error: 'Submission not found' });
    await auditLog(req.admin.id, 'delete', 'contact_submission', id, result.rows[0], null, req.ip || req.connection?.remoteAddress);

    res.json({ success: true, message: 'Submission deleted' });
  } catch (error) {
    console.error('Error deleting submission:', error);
    res.status(500).json({ error: 'Failed to delete submission' });
  }
});

// Audit Logs
router.get('/audit-logs', checkPermission(['view_audit']), async (req, res) => {
  try {
    const { admin_id, action, resource_type, limit } = req.query;
    
    let sql = `
      SELECT a.*, u.email as admin_email 
      FROM audit_logs a 
      LEFT JOIN admin_users u ON a.admin_id = u.id 
      WHERE 1=1
    `;
    let params = [];
    let pIdx = 1;

    if (admin_id) {
      sql += ` AND a.admin_id = $${pIdx++}`;
      params.push(admin_id);
    }
    
    if (action) {
      sql += ` AND a.action = $${pIdx++}`;
      params.push(action);
    }
    
    if (resource_type) {
      sql += ` AND a.resource_type = $${pIdx++}`;
      params.push(resource_type);
    }
    
    sql += ` ORDER BY a.created_at DESC LIMIT $${pIdx}`;
    params.push(parseInt(limit) || 100);
    
    const result = await query(sql, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
});

export default router;
