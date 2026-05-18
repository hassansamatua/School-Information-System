const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  user: 'root',
  password: 'hansco123',
  database: 'school_information_system',
  port: 3306
};

async function createMissingTables() {
  const connection = await mysql.createConnection(config);

  try {
    // Create submissions table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS submissions (
        id VARCHAR(191) PRIMARY KEY,
        type ENUM('ANNOUNCEMENT', 'EVENT', 'REPORT', 'ATTENDANCE', 'PERFORMANCE', 'OTHER') NOT NULL,
        title VARCHAR(191) NOT NULL,
        content TEXT NOT NULL,
        status ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED') DEFAULT 'DRAFT',
        data TEXT,
        targetAudience VARCHAR(191),
        targetId VARCHAR(191),
        submittedBy VARCHAR(191) NOT NULL,
        reviewedBy VARCHAR(191),
        reviewDate DATETIME,
        rejectionReason TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (submittedBy) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reviewedBy) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log('Created submissions table');

    // Create notifications table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS notifications (
        id VARCHAR(191) PRIMARY KEY,
        title VARCHAR(191) NOT NULL,
        message TEXT NOT NULL,
        type ENUM('INFO', 'WARNING', 'ERROR', 'SUCCESS') NOT NULL,
        userId VARCHAR(191) NOT NULL,
        isRead BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Created notifications table');

    // Create audit_logs table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(191) PRIMARY KEY,
        action VARCHAR(191) NOT NULL,
        entityType VARCHAR(191) NOT NULL,
        entityId VARCHAR(191) NOT NULL,
        details TEXT,
        ipAddress VARCHAR(191),
        userId VARCHAR(191) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('Created audit_logs table');

    // Create indexes for submissions
    await connection.execute(`CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status)`);
    console.log('Created submissions index');

    // Create indexes for notifications
    await connection.execute(`CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(userId)`);
    console.log('Created notifications index');

    // Create indexes for audit_logs
    await connection.execute(`CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entityType, entityId)`);
    await connection.execute(`CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(userId)`);
    console.log('Created audit_logs indexes');

    console.log('All missing tables created successfully');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

createMissingTables();
