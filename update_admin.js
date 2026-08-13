import db from './server/config/database.js';

async function updateAdmin() {
  try {
    const res = await db.execute({
      sql: "UPDATE users SET username = 'admin@sangath.com' WHERE username = 'admin'",
      args: []
    });
    console.log('Updated existing admin to admin@sangath.com', res);
    
    // Also, if they created any failed attempts or want to see existing users:
    const users = await db.execute('SELECT username, role FROM users');
    console.log('Current users:', users.rows);
  } catch (err) {
    console.error('Failed to update admin:', err);
  }
}

updateAdmin();
