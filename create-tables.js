const mysql = require('mysql2/promise');

const config = {
  host: 'localhost',
  user: 'root',
  password: 'hansco123',
  database: 'school_information_system',
  port: 3306
};

async function createTables() {
  let connection;
  try {
    connection = await mysql.createConnection(config);
    console.log('Connected to database');

    // Create announcements table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS announcements (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type ENUM('GENERAL', 'URGENT', 'ACADEMIC', 'EVENT', 'POLICY') NOT NULL,
        targetAudience ENUM('ALL', 'TEACHERS', 'PARENTS', 'SPECIFIC_CLASS', 'SPECIFIC_STUDENT', 'SPECIFIC') NOT NULL,
        targetId VARCHAR(36) NULL,
        status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
        attachments TEXT NULL,
        publishedAt DATETIME NULL,
        expiresAt DATETIME NULL,
        rejectionReason TEXT NULL,
        postedBy VARCHAR(36) NULL,
        approvedBy VARCHAR(36) NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_targetAudience (targetAudience),
        INDEX idx_postedBy (postedBy),
        INDEX idx_publishedAt (publishedAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Announcements table created successfully');

    // Create events table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        type ENUM('GENERAL', 'ACADEMIC', 'SPORTS', 'CULTURAL', 'MEETING', 'HOLIDAY') NOT NULL,
        targetAudience ENUM('ALL', 'TEACHERS', 'PARENTS', 'SPECIFIC_CLASS', 'SPECIFIC_STUDENT', 'SPECIFIC') NOT NULL,
        targetId VARCHAR(36) NULL,
        status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
        attachments TEXT NULL,
        eventDate DATE NOT NULL,
        eventTime TIME NULL,
        venue VARCHAR(255) NULL,
        postedBy VARCHAR(36) NULL,
        approvedBy VARCHAR(36) NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_targetAudience (targetAudience),
        INDEX idx_eventDate (eventDate),
        INDEX idx_postedBy (postedBy)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('Events table created successfully');

    console.log('All tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createTables();
