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
    console.log('🔧 Creating database tables...');
    
    connection = await mysql.createConnection(config);
    
    // Create tables in correct order
    const tables = [
      // Users table
      `CREATE TABLE users (
        id VARCHAR(191) PRIMARY KEY,
        email VARCHAR(191) UNIQUE NOT NULL,
        password VARCHAR(191) NOT NULL,
        role ENUM('ADMIN', 'TEACHER', 'PARENT') NOT NULL,
        isActive BOOLEAN DEFAULT TRUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      
      // Admins table
      `CREATE TABLE admins (
        id VARCHAR(191) PRIMARY KEY,
        userId VARCHAR(191) UNIQUE NOT NULL,
        firstName VARCHAR(191) NOT NULL,
        lastName VARCHAR(191) NOT NULL,
        phone VARCHAR(191),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )`,
      
      // Teachers table
      `CREATE TABLE teachers (
        id VARCHAR(191) PRIMARY KEY,
        userId VARCHAR(191) UNIQUE NOT NULL,
        firstName VARCHAR(191) NOT NULL,
        lastName VARCHAR(191) NOT NULL,
        phone VARCHAR(191),
        employeeId VARCHAR(191) UNIQUE NOT NULL,
        department VARCHAR(191),
        isActive BOOLEAN DEFAULT TRUE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )`,
      
      // Parents table
      `CREATE TABLE parents (
        id VARCHAR(191) PRIMARY KEY,
        userId VARCHAR(191) UNIQUE NOT NULL,
        firstName VARCHAR(191) NOT NULL,
        lastName VARCHAR(191) NOT NULL,
        phone VARCHAR(191),
        occupation VARCHAR(191),
        address TEXT,
        isApproved BOOLEAN DEFAULT FALSE,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )`,
      
      // Classes table
      `CREATE TABLE classes (
        id VARCHAR(191) PRIMARY KEY,
        name VARCHAR(191) NOT NULL,
        form INT NOT NULL CHECK (form BETWEEN 1 AND 4),
        stream VARCHAR(1) NOT NULL CHECK (stream IN ('A', 'B', 'C', 'D')),
        maxStudents INT DEFAULT 40,
        currentStudents INT DEFAULT 0,
        isActive BOOLEAN DEFAULT TRUE,
        teacherId VARCHAR(191),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (teacherId) REFERENCES teachers(id) ON DELETE SET NULL,
        UNIQUE KEY unique_form_stream (form, stream)
      )`,
      
      // Students table
      `CREATE TABLE students (
        id VARCHAR(191) PRIMARY KEY,
        registrationNumber VARCHAR(191) UNIQUE NOT NULL,
        firstName VARCHAR(191) NOT NULL,
        lastName VARCHAR(191) NOT NULL,
        dateOfBirth DATE NOT NULL,
        gender ENUM('MALE', 'FEMALE') NOT NULL,
        address TEXT,
        phone VARCHAR(191),
        email VARCHAR(191),
        isActive BOOLEAN DEFAULT TRUE,
        classId VARCHAR(191),
        parentId VARCHAR(191),
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE SET NULL,
        FOREIGN KEY (parentId) REFERENCES parents(id) ON DELETE SET NULL
      )`,
      
      // Attendance table
      `CREATE TABLE attendance (
        id VARCHAR(191) PRIMARY KEY,
        date DATE NOT NULL,
        status ENUM('PRESENT', 'ABSENT', 'LATE', 'EXCUSED') NOT NULL,
        remarks TEXT,
        studentId VARCHAR(191) NOT NULL,
        classId VARCHAR(191) NOT NULL,
        recordedBy VARCHAR(191) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (recordedBy) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_attendance (studentId, classId, date)
      )`,
      
      // Performance table
      `CREATE TABLE performance (
        id VARCHAR(191) PRIMARY KEY,
        subject VARCHAR(191) NOT NULL,
        assessmentType ENUM('QUIZ', 'TEST', 'ASSIGNMENT', 'PROJECT', 'EXAM') NOT NULL,
        score DECIMAL(5,2) NOT NULL,
        maxScore DECIMAL(5,2) NOT NULL,
        grade VARCHAR(10),
        remarks TEXT,
        assessmentDate DATE NOT NULL,
        studentId VARCHAR(191) NOT NULL,
        classId VARCHAR(191) NOT NULL,
        recordedBy VARCHAR(191) NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
        FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
        FOREIGN KEY (recordedBy) REFERENCES users(id) ON DELETE CASCADE
      )`,
      
      // Results table
      `CREATE TABLE results (
        id VARCHAR(191) PRIMARY KEY,
        examType ENUM('MIDTERM', 'FINAL', 'UNIT_TEST', 'PRACTICAL') NOT NULL,
        term VARCHAR(191) NOT NULL,
        academicYear VARCHAR(191) NOT NULL,
        subjects TEXT NOT NULL DEFAULT '[]',
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
      )`
    ];
    
    for (let i = 0; i < tables.length; i++) {
      try {
        await connection.query(tables[i]);
        console.log(`✅ Table ${i + 1}/${tables.length} created successfully`);
      } catch (error) {
        console.error(`❌ Table ${i + 1} failed:`, error.message);
      }
    }
    
    console.log('🎉 Tables creation completed!');
    
  } catch (error) {
    console.error('❌ Tables creation failed:', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

createTables().catch(console.error);