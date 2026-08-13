import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import db, { initializeDatabase } from '../config/database.js';
import { DEFAULT_WEBSITE_CONTENT } from '../../src/utils/storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..', '..');

export async function seedDatabase() {
  console.log('[SEED] Initializing database tables...');
  await initializeDatabase();

  try {
    // 1. Seed Super Admin User
    const defaultPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'Sangath@2026';
    const hash = bcrypt.hashSync(defaultPassword, 10);
    
    // We can't use INSERT OR IGNORE easily with checking if exists across dialects, but we can do a select first
    const adminCheck = await db.execute({ sql: "SELECT id FROM users WHERE username = 'admin'", args: [] });
    if (adminCheck.rows.length === 0) {
      await db.execute({
        sql: `INSERT INTO users (username, password_hash, display_name, role, permissions) VALUES (?, ?, ?, ?, ?)`,
        args: ['admin', hash, 'Super Admin', 'Super Admin', JSON.stringify(['all'])]
      });
      console.log('[SEED] Super admin user created (admin)');
    }

    // 2. Seed Website Content
    // We'll gather all statements for batch execution to save network roundtrips
    const contentStmts = [];
    for (const [pageKey, pageValue] of Object.entries(DEFAULT_WEBSITE_CONTENT)) {
      for (const [secKey, secValue] of Object.entries(pageValue)) {
        if (typeof secValue === 'object' && secValue !== null && !Array.isArray(secValue)) {
          for (const [k, v] of Object.entries(secValue)) {
            const valStr = typeof v === 'object' ? JSON.stringify(v) : String(v);
            const typeStr = typeof v === 'object' ? 'json' : 'text';
            contentStmts.push({
              sql: `INSERT OR REPLACE INTO site_content (page, section, content_key, content_value, content_type) VALUES (?, ?, ?, ?, ?)`,
              args: [pageKey, secKey, k, valStr, typeStr]
            });
          }
        } else {
          const valStr = typeof secValue === 'object' ? JSON.stringify(secValue) : String(secValue);
          const typeStr = typeof secValue === 'object' ? 'json' : 'text';
          contentStmts.push({
            sql: `INSERT OR REPLACE INTO site_content (page, section, content_key, content_value, content_type) VALUES (?, ?, ?, ?, ?)`,
            args: [pageKey, 'general', secKey, valStr, typeStr]
          });
        }
      }
    }
    await db.batch(contentStmts, "write");
    console.log('[SEED] Site content seeded from defaults');

    // 3. Seed Products from public/products.json
    const productsJsonPath = path.join(projectRoot, 'public', 'products.json');
    if (fs.existsSync(productsJsonPath)) {
      const rawProducts = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));
      const categoriesList = rawProducts.categories || [];

      let catSort = 0;
      for (const cat of categoriesList) {
        catSort++;
        await db.execute({
          sql: `INSERT OR IGNORE INTO categories (slug, name, description, sort_order) VALUES (?, ?, ?, ?)`,
          args: [cat.id, cat.name, cat.description || '', catSort]
        });
        
        const catRes = await db.execute({ sql: 'SELECT id FROM categories WHERE slug = ?', args: [cat.id] });
        if (catRes.rows.length === 0) continue;
        const catRow = catRes.rows[0];

        let prodSort = 0;
        for (const prod of cat.products || []) {
          prodSort++;
          await db.execute({
            sql: `INSERT OR IGNORE INTO products (category_id, slug, name, description, image, video, featured, price, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [catRow.id, prod.id, prod.name, prod.description || '', prod.image || '/images/Cumin_Seeds.jpg', prod.video || '', prod.featured ? 1 : 0, prod.price || null, prodSort]
          });

          const prodRes = await db.execute({ sql: 'SELECT id FROM products WHERE slug = ?', args: [prod.id] });
          if (prodRes.rows.length === 0) continue;
          const prodRow = prodRes.rows[0];

          // We'll batch related items for speed
          const detailStmts = [];
          
          if (Array.isArray(prod.images)) {
            let imgSort = 0;
            for (const img of prod.images) {
              imgSort++;
              detailStmts.push({
                sql: `INSERT INTO product_images (product_id, file_path, sort_order) VALUES (?, ?, ?)`,
                args: [prodRow.id, img, imgSort]
              });
            }
          }

          if (Array.isArray(prod.specifications)) {
            let specSort = 0;
            for (const spec of prod.specifications) {
              specSort++;
              detailStmts.push({
                sql: `INSERT INTO product_specifications (product_id, variety, origin, specification, packaging, fcl, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                args: [prodRow.id, spec.variety || '', spec.origin || '', spec.specification || '', spec.packaging || '', spec.fcl || '', specSort]
              });
            }
          }

          if (detailStmts.length > 0) {
            await db.batch(detailStmts, "write");
          }

          // Product details (requires lastInsertRowid, so doing it one by one)
          if (Array.isArray(prod.details)) {
            let detailSort = 0;
            for (const detail of prod.details) {
              detailSort++;
              const info = await db.execute({
                sql: `INSERT INTO product_details (product_id, block_type, title, content, sort_order) VALUES (?, ?, ?, ?, ?)`,
                args: [prodRow.id, detail.type || 'text', detail.title || '', detail.content || '', detailSort]
              });

              if (Array.isArray(detail.items) && info.lastInsertRowid) {
                const itemStmts = [];
                let itemSort = 0;
                for (const item of detail.items) {
                  itemSort++;
                  itemStmts.push({
                    sql: `INSERT INTO product_detail_items (detail_id, content, sort_order) VALUES (?, ?, ?)`,
                    args: [info.lastInsertRowid.toString(), item, itemSort]
                  });
                }
                if (itemStmts.length > 0) await db.batch(itemStmts, "write");
              }
            }
          }
        }
      }
      console.log('[SEED] Categories and products seeded from products.json');
    }

    // 4. Seed Default Menu Items
    const menuCountRes = await db.execute('SELECT COUNT(*) as count FROM menu_items');
    const menuCount = menuCountRes.rows[0].count;
    
    if (menuCount === 0) {
      const menuStmts = [
        { sql: `INSERT OR IGNORE INTO menu_items (label, page, sort_order) VALUES (?, ?, ?)`, args: ['Home', 'home', 1] },
        { sql: `INSERT OR IGNORE INTO menu_items (label, page, sort_order) VALUES (?, ?, ?)`, args: ['About Us', 'about', 2] },
        { sql: `INSERT OR IGNORE INTO menu_items (label, page, sort_order) VALUES (?, ?, ?)`, args: ['Products', 'products', 3] },
        { sql: `INSERT OR IGNORE INTO menu_items (label, page, sort_order) VALUES (?, ?, ?)`, args: ['Exports / Imports', 'exports-imports', 4] },
        { sql: `INSERT OR IGNORE INTO menu_items (label, page, sort_order) VALUES (?, ?, ?)`, args: ['Quality', 'quality', 5] },
        { sql: `INSERT OR IGNORE INTO menu_items (label, page, sort_order) VALUES (?, ?, ?)`, args: ['Contact Us', 'contact', 6] }
      ];
      await db.batch(menuStmts, "write");
      console.log('[SEED] Default menu items seeded');
    }

    console.log('[SEED] Seeding completed successfully!');
  } catch (err) {
    console.error('[SEED] Error during seeding:', err);
  }
}

// Run directly if called as main script
if (process.argv[1] && process.argv[1].endsWith('seed.js')) {
  seedDatabase().then(() => process.exit(0)).catch((err) => {
    console.error('[SEED] Fatal error seeding database:', err);
    process.exit(1);
  });
}
