import { Router } from 'express';
import db from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';
import { requirePermission } from '../middleware/rbac.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const catRes = await db.execute("SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
    const categories = catRes.rows;
    
    const prodRes = await db.execute("SELECT * FROM products WHERE is_active = 1 ORDER BY sort_order ASC, id ASC");
    const products = prodRes.rows;

    const imgRes = await db.execute("SELECT * FROM product_images ORDER BY sort_order ASC");
    const allImages = imgRes.rows;
    
    const specRes = await db.execute("SELECT * FROM product_specifications ORDER BY sort_order ASC");
    const allSpecs = specRes.rows;

    const detRes = await db.execute("SELECT * FROM product_details ORDER BY sort_order ASC");
    const allDetails = detRes.rows;

    const itemRes = await db.execute("SELECT * FROM product_detail_items ORDER BY sort_order ASC");
    const allItems = itemRes.rows;

    const productMap = {};
    products.forEach(p => {
      const pImages = allImages.filter(i => i.product_id === p.id).map(i => i.file_path);
      const pSpecs = allSpecs.filter(s => s.product_id === p.id);
      const pDetails = allDetails.filter(d => d.product_id === p.id).map(d => {
        const dItems = allItems.filter(i => i.detail_id === d.id).map(i => i.content);
        return {
          type: d.block_type,
          title: d.title,
          content: d.content,
          items: dItems
        };
      });

      const formattedProduct = {
        id: p.slug || String(p.id),
        dbId: p.id,
        categoryId: p.category_id,
        name: p.name,
        description: p.description,
        image: p.image,
        images: pImages.length > 0 ? pImages : (p.image ? [p.image] : []),
        video: p.video,
        featured: Boolean(p.featured),
        price: p.price,
        specifications: pSpecs,
        details: pDetails
      };

      productMap[p.category_id] = productMap[p.category_id] || [];
      productMap[p.category_id].push(formattedProduct);
    });

    const result = {
      categories: categories.map(c => ({
        id: c.slug || String(c.id),
        dbId: c.id,
        name: c.name,
        description: c.description,
        image: c.image,
        products: productMap[c.id] || []
      }))
    };

    res.json(result);
  } catch (error) {
    console.error('Fetch products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pId = req.params.id;
    const prodRes = await db.execute({
      sql: "SELECT * FROM products WHERE (id = ? OR slug = ?) AND is_active = 1",
      args: [pId, pId]
    });
    const p = prodRes.rows[0];
    if (!p) return res.status(404).json({ error: 'Product not found' });

    const pImgRes = await db.execute({ sql: "SELECT * FROM product_images WHERE product_id = ?", args: [p.id] });
    const pImages = pImgRes.rows.map(i => i.file_path);
    
    const pSpecRes = await db.execute({ sql: "SELECT * FROM product_specifications WHERE product_id = ?", args: [p.id] });
    const pSpecs = pSpecRes.rows;
    
    const pDetRes = await db.execute({ sql: "SELECT * FROM product_details WHERE product_id = ?", args: [p.id] });
    const pDetails = await Promise.all(pDetRes.rows.map(async d => {
      const dItemRes = await db.execute({ sql: "SELECT * FROM product_detail_items WHERE detail_id = ?", args: [d.id] });
      const dItems = dItemRes.rows.map(i => i.content);
      return {
        type: d.block_type,
        title: d.title,
        content: d.content,
        items: dItems
      };
    }));

    const formattedProduct = {
      id: p.slug || String(p.id),
      dbId: p.id,
      categoryId: p.category_id,
      name: p.name,
      description: p.description,
      image: p.image,
      images: pImages.length > 0 ? pImages : (p.image ? [p.image] : []),
      video: p.video,
      featured: Boolean(p.featured),
      price: p.price,
      specifications: pSpecs,
      details: pDetails
    };

    res.json(formattedProduct);
  } catch (error) {
    console.error('Fetch product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', authenticateToken, requirePermission('products', 'all'), upload.single('image'), async (req, res) => {
  try {
    const { name, description, category_id, video, featured, price, specifications, details, image } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let imagePath = image || '/images/Cumin_Seeds.jpg';
    
    if (req.file) {
      // req.file.path is the Cloudinary URL
      imagePath = req.file.path;
    }

    // Resolve category integer ID
    let categoryIntId = parseInt(category_id, 10);
    if (isNaN(categoryIntId)) {
      const catRes = await db.execute({ sql: "SELECT id FROM categories WHERE slug = ? OR id = ?", args: [category_id, category_id] });
      if (catRes.rows.length > 0) categoryIntId = catRes.rows[0].id;
      else categoryIntId = 1;
    }

    const pInfo = await db.execute({
      sql: 'INSERT INTO products (category_id, slug, name, description, image, video, featured, price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      args: [categoryIntId, slug, name, description || '', imagePath, video || '', (featured === '1' || featured === 'true' || featured === true) ? 1 : 0, price ? parseFloat(price) : null]
    });
    
    const productId = pInfo.lastInsertRowid.toString();

    if (specifications) {
      let specs = specifications;
      if (typeof specs === 'string') { try { specs = JSON.parse(specs); } catch(e) {} }
      if (Array.isArray(specs)) {
        let sort = 0;
        const specStmts = [];
        for (const spec of specs) {
          sort++;
          specStmts.push({
            sql: 'INSERT INTO product_specifications (product_id, variety, origin, specification, packaging, fcl, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
            args: [productId, spec.variety || '', spec.origin || '', spec.specification || '', spec.packaging || '', spec.fcl || '', sort]
          });
        }
        if (specStmts.length > 0) await db.batch(specStmts, "write");
      }
    }

    if (details) {
      let dets = details;
      if (typeof dets === 'string') { try { dets = JSON.parse(dets); } catch(e) {} }
      if (Array.isArray(dets)) {
        let detSort = 0;
        for (const det of dets) {
          detSort++;
          const dInfo = await db.execute({
            sql: 'INSERT INTO product_details (product_id, block_type, title, content, sort_order) VALUES (?, ?, ?, ?, ?)',
            args: [productId, det.type || 'text', det.title || '', det.content || '', detSort]
          });
          
          if (Array.isArray(det.items) && dInfo.lastInsertRowid) {
            let itemSort = 0;
            const itemStmts = [];
            for (const item of det.items) {
              itemSort++;
              itemStmts.push({
                sql: 'INSERT INTO product_detail_items (detail_id, content, sort_order) VALUES (?, ?, ?)',
                args: [dInfo.lastInsertRowid.toString(), typeof item === 'object' ? (item.content || item.value) : String(item), itemSort]
              });
            }
            if (itemStmts.length > 0) await db.batch(itemStmts, "write");
          }
        }
      }
    }

    res.status(201).json({ id: slug, dbId: productId, message: 'Product created successfully' });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/:id', authenticateToken, requirePermission('products', 'all'), upload.single('image'), async (req, res) => {
  try {
    const pId = req.params.id;
    const findRes = await db.execute({ sql: "SELECT id FROM products WHERE id = ? OR slug = ?", args: [pId, pId] });
    const existing = findRes.rows[0];
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    const { name, description, category_id, video, featured, price, specifications, details, image } = req.body;
    let updateFields = ['name = ?', 'description = ?', 'video = ?', 'featured = ?'];
    let params = [name, description || '', video || '', (featured === '1' || featured === 'true' || featured === true) ? 1 : 0];

    if (category_id) {
      let categoryIntId = parseInt(category_id, 10);
      if (isNaN(categoryIntId)) {
        const catRes = await db.execute({ sql: "SELECT id FROM categories WHERE slug = ? OR id = ?", args: [category_id, category_id] });
        if (catRes.rows.length > 0) categoryIntId = catRes.rows[0].id;
      }
      if (!isNaN(categoryIntId)) {
        updateFields.push('category_id = ?');
        params.push(categoryIntId);
      }
    }

    if (price !== undefined) {
      updateFields.push('price = ?');
      params.push(price ? parseFloat(price) : null);
    }

    if (req.file) {
      updateFields.push('image = ?');
      params.push(req.file.path);
    } else if (image) {
      updateFields.push('image = ?');
      params.push(image);
    }

    params.push(existing.id);
    await db.execute({
      sql: `UPDATE products SET ${updateFields.join(', ')} WHERE id = ?`,
      args: params
    });

    // Update specs and details if provided
    if (specifications !== undefined) {
      await db.execute({ sql: "DELETE FROM product_specifications WHERE product_id = ?", args: [existing.id] });
      let specs = specifications;
      if (typeof specs === 'string') { try { specs = JSON.parse(specs); } catch(e) {} }
      if (Array.isArray(specs)) {
        let sort = 0;
        const specStmts = [];
        for (const spec of specs) {
          sort++;
          specStmts.push({
            sql: 'INSERT INTO product_specifications (product_id, variety, origin, specification, packaging, fcl, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
            args: [existing.id, spec.variety || '', spec.origin || '', spec.specification || '', spec.packaging || '', spec.fcl || '', sort]
          });
        }
        if (specStmts.length > 0) await db.batch(specStmts, "write");
      }
    }

    if (details !== undefined) {
      await db.execute({ sql: "DELETE FROM product_details WHERE product_id = ?", args: [existing.id] });
      let dets = details;
      if (typeof dets === 'string') { try { dets = JSON.parse(dets); } catch(e) {} }
      if (Array.isArray(dets)) {
        let detSort = 0;
        for (const det of dets) {
          detSort++;
          const dInfo = await db.execute({
            sql: 'INSERT INTO product_details (product_id, block_type, title, content, sort_order) VALUES (?, ?, ?, ?, ?)',
            args: [existing.id, det.type || 'text', det.title || '', det.content || '', detSort]
          });
          if (Array.isArray(det.items) && dInfo.lastInsertRowid) {
            let itemSort = 0;
            const itemStmts = [];
            for (const item of det.items) {
              itemSort++;
              itemStmts.push({
                sql: 'INSERT INTO product_detail_items (detail_id, content, sort_order) VALUES (?, ?, ?)',
                args: [dInfo.lastInsertRowid.toString(), typeof item === 'object' ? (item.content || item.value) : String(item), itemSort]
              });
            }
            if (itemStmts.length > 0) await db.batch(itemStmts, "write");
          }
        }
      }
    }

    res.json({ message: 'Product updated successfully' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', authenticateToken, requirePermission('products', 'all'), async (req, res) => {
  try {
    const pId = req.params.id;
    const findRes = await db.execute({ sql: "SELECT id FROM products WHERE id = ? OR slug = ?", args: [pId, pId] });
    const existing = findRes.rows[0];
    if (!existing) return res.status(404).json({ error: 'Product not found' });

    await db.execute({ sql: 'DELETE FROM products WHERE id = ?', args: [existing.id] });
    
    res.json({ message: 'Product deleted' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
