import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const password = process.env.ADMIN_PASSWORD || 'SuperSecure123!'
const email = process.env.ADMIN_EMAIL || 'admin@example.com'
const role = process.env.ADMIN_ROLE || 'super_admin'

const user = {
  id: uuidv4(),
  email,
  password_hash: bcryptjs.hashSync(password, 12),
  role,
  status: 'active',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

const output = JSON.stringify(user, null, 2)
const filePath = join(process.cwd(), 'admin-user.json')
writeFileSync(filePath, output)

console.log('Admin user template created:', filePath)
console.log('Use this data to insert into the admin_users table or import into your DB.')
console.log('Email:', email)
console.log('Password:', password)

// If run with --insert, upsert into DB
if (process.argv.includes('--insert')) {
  (async () => {
    try {
      const { query } = await import('../config/database.js');
      const upsert = await query(
        `INSERT INTO admin_users (id, email, password_hash, role, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash, role = EXCLUDED.role, status = EXCLUDED.status, updated_at = EXCLUDED.updated_at
         RETURNING *`,
        [user.id, user.email, user.password_hash, user.role, user.status, user.created_at, user.updated_at]
      );

      console.log('Admin upserted into database:', upsert.rows[0]);
      process.exit(0);
    } catch (err) {
      console.error('Failed to insert admin into DB:', err);
      process.exit(1);
    }
  })();
}
