const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  user: 'root',
  password: 'hansco123',
  database: 'school_information_system',
  port: 3306
};

async function fixResultsTable() {
  let connection;
  try {
    console.log('🔧 Fixing results table...');
    
    connection = await mysql.createConnection(config);
    
    // Drop and recreate the results table without default value for TEXT column
    await connection.query('DROP TABLE IF EXISTS results');
    
    const createResultsTable = `CREATE TABLE results (
      id VARCHAR(191) PRIMARY KEY,
      examType ENUM('MIDTERM', 'FINAL', 'UNIT_TEST', 'PRACTICAL') NOT NULL,
      term VARCHAR(191) NOT NULL,
      academicYear VARCHAR(191) NOT NULL,
      subjects TEXT,
      totalMarks DECIMAL(6,2) NOT NULL,
      maxTotalMarks DECIMAL(6,2) NOT NULL,
      percentage DECIMAL(5,2) NOT NULL,
      grade VARCHAR(10) NOT NULL,
      rank INT,
      remarks TEXT,
      publishedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      studentId VARCHAR(191) NOT NULL,
      classId VARCHAR(191) NOT NULL,
      publishedBy VARCHAR(191) NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
      FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
      FOREIGN KEY (publishedBy) REFERENCES users(id) ON DELETE CASCADE
    )`;
    
    await connection.query(createResultsTable);
    console.log('✅ Results table fixed successfully!');
    
    // Verify all tables were created
    const [tables] = await connection.query('SHOW TABLES');
    console.log('\n📋 Created tables:');
    tables.forEach(table => {
      console.log(`  - ${Object.values(table)[0]}`);
    });
    
  } catch (error) {
    console.error('❌ Fix failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

fixResultsTable().catch(console.error);