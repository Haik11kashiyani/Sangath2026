import fs from 'fs';
import path from 'path';
import { query } from '../config/database.js';

(async () => {
  try {
    const sqlPath = path.resolve(new URL(import.meta.url).pathname, '..', '..', 'migrations', '004_refresh_tokens.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('Running migration 004_refresh_tokens.sql...');
    const res = await query(sql);
    console.log('Migration executed:', res.command || 'OK');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
})();
