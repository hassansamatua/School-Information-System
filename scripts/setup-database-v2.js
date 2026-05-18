const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const config = {
  host: 'localhost',
  user: 'root',
  password: 'hansco123',
  database: 'school_information_system',
  port: 3306
};

async function setupDatabase() {
  let connection;
  try {
    console.log('🔧 Setting up database...');
    
    // Connect to MySQL server (without specifying database)
    connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      port: config.port
    });
    
    // Drop and recreate database
    console.log('📁 Dropping and recreating database...');
    await connection.query(`DROP DATABASE IF EXISTS ${config.database}`);
    await connection.query(`CREATE DATABASE ${config.database}`);
    
    // Close current connection and reconnect to the specific database
    await connection.end();
    connection = await mysql.createConnection(config);
    
    // Read and execute schema
    console.log('📋 Reading schema file...');
    const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`🏗️  Executing ${statements.length} SQL statements...`);
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          await connection.query(statement);
          console.log(`✅ Statement ${i + 1}/${statements.length} executed successfully`);
        } catch (error) {
          console.error(`❌ Statement ${i + 1} failed:`, statement.substring(0, 100) + '...');
          console.error('Error:', error.message);
        }
      }
    }
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Run the setup
setupDatabase().catch(console.error);