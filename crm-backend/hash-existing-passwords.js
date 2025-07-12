const pool = require('./config/db');
const { hashPassword } = require('./utilis/passwordHelper');

async function updatePasswordHashes() {
  try {
    console.log('Updating password hashes in database...');
    
    // Get all users with plain text passwords
    const users = await pool.query('SELECT id, email, password FROM users');
    
    console.log(`Found ${users.rows.length} users to update`);
    
    for (const user of users.rows) {
      // Check if password is already hashed (bcrypt hashes start with $2)
      if (user.password.startsWith('$2')) {
        continue;
      }
      
      // Hash the plain text password
      const hashedPassword = hashPassword(user.password);
      
      // Update the user with hashed password
      await pool.query(
        'UPDATE users SET password = $1 WHERE id = $2',
        [hashedPassword, user.id]
      );
      
      console.log(` Updated password for user: ${user.email}`);
    }
    
    console.log(' All passwords have been hashed successfully!');
    console.log(' Test credentials:');
    console.log('   admin@example.com / admin123');
    console.log('   sales@example.com / sales123');
    console.log('   finance@example.com / finance123');
    
  } catch (error) {
    console.error('Error updating password hashes:', error);
  } finally {
    await pool.end();
  }
}

updatePasswordHashes();
