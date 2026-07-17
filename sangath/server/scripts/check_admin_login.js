import { query } from '../config/database.js';
import bcryptjs from 'bcryptjs';

(async () => {
  try {
    const res = await query('SELECT * FROM admin_users WHERE email = $1', ['admin@example.com']);
    console.log('DB rows:', res.rows.length);
    if (res.rows.length === 0) {
      console.log('Admin not found');
      process.exit(0);
    }
    const admin = res.rows[0];
    console.log('Admin id:', admin.id, 'role:', admin.role, 'status:', admin.status);
    const match = await bcryptjs.compare('SuperSecure123!', admin.password_hash);
    console.log('Password match:', match);
  } catch (err) {
    console.error('DB error:', err);
    process.exit(1);
  }
})();
