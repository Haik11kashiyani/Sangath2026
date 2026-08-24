import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission, requireRole } from '../middleware/rbac.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const resultSet = await db.execute('SELECT page, section, image_key, file_path FROM site_images');
    const rows = resultSet.rows;
    
    const images = {};
    rows.forEach(row => {
      if (!images[row.page]) images[row.page] = {};
      if (row.section) {
        if (!images[row.page][row.section]) images[row.page][row.section] = {};
        images[row.page][row.section][row.image_key] = row.file_path;
      } else {
        images[row.page][row.image_key] = row.file_path;
      }
    });
    
    res.json(images);
  } catch (error) {
    console.error('Fetch images error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/upload', authenticateToken, requirePermission('cms', 'images', 'all'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image provided' });
    const { page, section, image_key } = req.body;
    
    // Cloudinary gives us the absolute URL in req.file.path
    const fileUrl = req.file.path;

    await db.execute({
      sql: `INSERT INTO site_images (page, section, image_key, file_path, updated_by, updated_at) VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP) ON CONFLICT(page, section, image_key) DO UPDATE SET file_path = excluded.file_path, updated_by = excluded.updated_by, updated_at = CURRENT_TIMESTAMP`,
      args: [page, section || '', image_key, fileUrl, req.user.id]
    });
    
    res.json({ message: 'Image uploaded', file_path: fileUrl });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, requireRole('Super Admin'), async (req, res) => {
  try {
    const resultSet = await db.execute({
      sql: 'SELECT file_path FROM site_images WHERE id = ?',
      args: [req.params.id]
    });
    const image = resultSet.rows[0];
    
    if (!image) return res.status(404).json({ error: 'Image not found' });
    
    await db.execute({
      sql: 'DELETE FROM site_images WHERE id = ?',
      args: [req.params.id]
    });
    
    // Cloudinary deletion is usually handled via cloudinary API if we want to clean up remote files.
    // For now, just deleting from DB is sufficient to remove it from the site.
    
    res.json({ message: 'Image deleted' });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
