import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../config/database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  try {
    const sqlPath = path.join(__dirname, '..', 'migrations', '004_refresh_tokens.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    console.log('Running migration 004_refresh_tokens.sql...');
    await query(sql);
    console.log('Migration executed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
})();
