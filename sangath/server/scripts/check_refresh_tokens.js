import { query } from '../config/database.js';

(async () => {
  try {
    const res = await query(`SELECT rt.id, rt.admin_id, rt.expires_at, a.email FROM refresh_tokens rt JOIN admin_users a ON a.id = rt.admin_id WHERE a.email = $1`, ['admin@example.com']);
    console.log('Refresh tokens rows:', res.rowCount);
    for (const r of res.rows) console.log(r);
    process.exit(0);
  } catch (err) {
    console.error('DB error:', err);
    process.exit(1);
  }
})();
