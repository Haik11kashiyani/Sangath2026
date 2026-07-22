#!/usr/bin/env node

/**
 * Database seeding script
 * Usage: npm run seed
 * 
 * Initializes the database with:
 * - Default admin user (if not exists)
 * - Default site settings
 * - Default categories
 * - Sample pages
 */

import dotenv from 'dotenv';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../../.env') });

const { Pool } = pkg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'sangath_ie',
  user: process.env.DB_USER || 'sangath_user',
  password: process.env.DB_PASSWORD || 'sangath_password'
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@sangath.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'SuperSecure123!';

async function seed() {
  const client = await pool.connect();
  
  try {
    console.log('🌱 Starting database seed...\n');

    const existingCounts = await client.query(`
      SELECT
        (SELECT COUNT(*)::int FROM admin_users) AS admin_count,
        (SELECT COUNT(*)::int FROM categories) AS category_count,
        (SELECT COUNT(*)::int FROM pages) AS page_count,
        (SELECT COUNT(*)::int FROM site_settings) AS setting_count,
        (SELECT COUNT(*)::int FROM products) AS product_count
    `);

    const counts = existingCounts.rows[0];

    if (
      counts.admin_count > 0 &&
      counts.category_count > 0 &&
      counts.page_count > 0 &&
      counts.setting_count > 0 &&
      counts.product_count > 0
    ) {
      console.log('✅ Seed data already present. Skipping insert operations.\n');
      return;
    }
    
    // 1. Create default admin user
    console.log('📝 Creating default admin user...');
    const adminId = uuidv4();
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
    
    await client.query(
      `INSERT INTO admin_users (id, email, password_hash, role, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         status = 'active'
       RETURNING id, email, role`,
      [adminId, ADMIN_EMAIL, hashedPassword, 'super_admin', 'active']
    );
    console.log(`✅ Admin user: ${ADMIN_EMAIL}\n`);
    
    // 2. Create default site settings
    console.log('⚙️  Creating default site settings...');
    const defaultSettings = {
      platform_name: 'Sangath',
      platform_tagline: 'Premium Agricultural Products',
      contact_email: 'info@sangath.com',
      contact_phone: '+91-XXXXXXXXXX',
      address: 'Sangath Headquarters',
      social_facebook: 'https://facebook.com/sangath',
      social_twitter: 'https://twitter.com/sangath',
      social_instagram: 'https://instagram.com/sangath',
      social_linkedin: 'https://linkedin.com/company/sangath',
      about_us: 'Leading provider of premium agricultural products',
      privacy_policy: 'Your privacy is important to us',
      terms_conditions: 'Terms and conditions apply'
    };
    
    for (const [key, value] of Object.entries(defaultSettings)) {
      await client.query(
        `INSERT INTO site_settings (key, value, updated_at)
         VALUES ($1, $2::jsonb, NOW())
         ON CONFLICT (key) DO UPDATE SET
           value = EXCLUDED.value,
           updated_at = NOW()`,
        [key, JSON.stringify(value)]
      );
    }
    console.log('✅ Site settings created\n');
    
    // 3. Create default categories
    console.log('📂 Creating default categories...');
    const categories = [
      { slug: 'fresh-produce', name: 'Fresh Produce', description: 'Fresh vegetables and fruits' },
      { slug: 'grains-cereals', name: 'Grains & Cereals', description: 'Quality grains and cereals' },
      { slug: 'spices', name: 'Spices', description: 'Premium quality spices' },
      { slug: 'organic-products', name: 'Organic Products', description: 'Certified organic products' },
      { slug: 'herbs', name: 'Herbs', description: 'Medicinal and culinary herbs' }
    ];
    
    for (const cat of categories) {
      await client.query(
        `INSERT INTO categories (id, slug, name, description, created_at, updated_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           description = EXCLUDED.description,
           updated_at = NOW()`,
        [uuidv4(), cat.slug, cat.name, cat.description]
      );
    }
    console.log(`✅ ${categories.length} categories created\n`);
    
    // 4. Create default pages
    console.log('📄 Creating default pages...');
    const pages = [
      {
        slug: 'home',
        title: 'Home',
        content: '<h1>Welcome to Sangath</h1><p>Your premium agricultural products partner</p>',
        meta_description: 'Sangath - Premium Agricultural Products',
        is_published: true
      },
      {
        slug: 'about',
        title: 'About Us',
        content: '<h1>About Sangath</h1><p>We are committed to delivering premium quality agricultural products</p>',
        meta_description: 'Learn about Sangath',
        is_published: true
      },
      {
        slug: 'contact',
        title: 'Contact Us',
        content: '<h1>Contact Us</h1><p>Get in touch with our team</p>',
        meta_description: 'Contact Sangath',
        is_published: true
      }
    ];
    
    for (const page of pages) {
      await client.query(
        `INSERT INTO pages (id, slug, title, content, meta_description, is_published, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         ON CONFLICT (slug) DO NOTHING`,
        [uuidv4(), page.slug, page.title, page.content, page.meta_description, page.is_published]
      );
    }
    console.log(`✅ ${pages.length} default pages created\n`);
    
    console.log('✨ Database seeding complete!\n');
    console.log('📋 Seed Summary:');
    console.log(`   - Admin User: ${ADMIN_EMAIL}`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Pages: ${pages.length}`);
    console.log(`   - Site Settings: ${Object.keys(defaultSettings).length}`);
    console.log('\n✅ Ready for deployment!\n');
    
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  } finally {
    await client.release();
    await pool.end();
  }
}

seed();
