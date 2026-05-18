-- School Information System Database Schema
-- Created for MySQL/MariaDB

-- Drop tables if they exist (for fresh start)
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS approvals;
DROP TABLE IF EXISTS reports;
DROP TABLE IF EXISTS announcements;
DROP TABLE IF EXISTS events;
DROP TABLE IF EXISTS results;
DROP TABLE IF EXISTS performance;
DROP TABLE IF EXISTS attendance;
DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS classes;
DROP TABLE IF EXISTS parents;
DROP TABLE IF EXISTS teachers;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
  id VARCHAR(191) PRIMARY KEY,
  email VARCHAR(191) UNIQUE NOT NULL,
  password VARCHAR(191) NOT NULL,
  role ENUM('ADMIN', 'TEACHER', 'PARENT') NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admins table
CREATE TABLE admins (
  id VARCHAR(191) PRIMARY KEY,
  userId VARCHAR(191) UNIQUE NOT NULL,
  firstName VARCHAR(191) NOT NULL,
  lastName VARCHAR(191) NOT NULL,
  phone VARCHAR(191),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Teachers table
CREATE TABLE teachers (
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
);

-- Parents table
CREATE TABLE parents (
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
);

-- Classes table
CREATE TABLE classes (
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
);

-- Students table
CREATE TABLE students (
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
);

-- Attendance table
CREATE TABLE attendance (
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
);

-- Performance table
CREATE TABLE performance (
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
);

-- Results table
CREATE TABLE results (
  id VARCHAR(191) PRIMARY KEY,
  examType ENUM('MIDTERM', 'FINAL', 'UNIT_TEST', 'PRACTICAL') NOT NULL,
  term VARCHAR(191) NOT NULL,
  academicYear VARCHAR(191) NOT NULL,
  subjects TEXT NOT NULL DEFAULT '[]', -- JSON string
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
);

-- Announcements table
CREATE TABLE announcements (
  id VARCHAR(191) PRIMARY KEY,
  title VARCHAR(191) NOT NULL,
  content TEXT NOT NULL,
  type ENUM('GENERAL', 'URGENT', 'ACADEMIC', 'EVENT', 'POLICY') NOT NULL,
  targetAudience ENUM('ALL', 'TEACHERS', 'PARENTS', 'SPECIFIC') NOT NULL,
  targetId VARCHAR(191),
  status ENUM('DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED', 'REJECTED') DEFAULT 'DRAFT',
  attachments TEXT DEFAULT '[]', -- JSON string
  publishedAt DATETIME,
  expiresAt DATETIME,
  rejectionReason TEXT,
  postedBy VARCHAR(191),
  approvedBy VARCHAR(191),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (postedBy) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approvedBy) REFERENCES users(id) ON DELETE SET NULL
);

-- Events table
CREATE TABLE events (
  id VARCHAR(191) PRIMARY KEY,
  title VARCHAR(191) NOT NULL,
  description TEXT NOT NULL,
  type ENUM('GENERAL', 'ACADEMIC', 'SPORTS', 'CULTURAL', 'MEETING', 'HOLIDAY') NOT NULL,
  targetAudience ENUM('ALL', 'TEACHERS', 'PARENTS', 'SPECIFIC') NOT NULL,
  targetId VARCHAR(191),
  status ENUM('DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED', 'CANCELLED') DEFAULT 'DRAFT',
  attachments TEXT DEFAULT '[]', -- JSON string
  eventDate DATE NOT NULL,
  eventTime TIME,
  venue VARCHAR(191),
  postedBy VARCHAR(191),
  approvedBy VARCHAR(191),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (postedBy) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (approvedBy) REFERENCES users(id) ON DELETE SET NULL
);

-- Submissions table
CREATE TABLE submissions (
  id VARCHAR(191) PRIMARY KEY,
  type ENUM('ANNOUNCEMENT', 'EVENT', 'REPORT', 'OTHER') NOT NULL,
  title VARCHAR(191) NOT NULL,
  content TEXT NOT NULL,
  status ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED') DEFAULT 'DRAFT',
  data TEXT DEFAULT '{}', -- JSON string
  submittedBy VARCHAR(191) NOT NULL,
  targetStudentId VARCHAR(191),
  targetClassId VARCHAR(191),
  reviewedBy VARCHAR(191),
  reviewDate DATETIME,
  rejectionReason TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (submittedBy) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (targetStudentId) REFERENCES students(id) ON DELETE SET NULL,
  FOREIGN KEY (targetClassId) REFERENCES classes(id) ON DELETE SET NULL,
  FOREIGN KEY (reviewedBy) REFERENCES users(id) ON DELETE SET NULL
);

-- Approvals table
CREATE TABLE approvals (
  id VARCHAR(191) PRIMARY KEY,
  type ENUM('ANNOUNCEMENT', 'EVENT', 'REPORT', 'OTHER') NOT NULL,
  itemId VARCHAR(191) NOT NULL,
  submittedBy VARCHAR(191) NOT NULL,
  approvedBy VARCHAR(191),
  status ENUM('PENDING', 'APPROVED', 'REJECTED') DEFAULT 'PENDING',
  comments TEXT,
  submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewedAt DATETIME,
  FOREIGN KEY (submittedBy) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approvedBy) REFERENCES users(id) ON DELETE SET NULL
);

-- Reports table
CREATE TABLE reports (
  id VARCHAR(191) PRIMARY KEY,
  title VARCHAR(191) NOT NULL,
  type ENUM('ACADEMIC', 'ATTENDANCE', 'PERFORMANCE', 'FINANCIAL', 'GENERAL') NOT NULL,
  description TEXT,
  parameters TEXT DEFAULT '{}', -- JSON string
  data TEXT DEFAULT '{}', -- JSON string
  status ENUM('DRAFT', 'PENDING', 'APPROVED', 'PUBLISHED') DEFAULT 'DRAFT',
  generatedBy VARCHAR(191) NOT NULL,
  generatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (generatedBy) REFERENCES users(id) ON DELETE CASCADE
);

-- Notifications table
CREATE TABLE notifications (
  id VARCHAR(191) PRIMARY KEY,
  title VARCHAR(191) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('INFO', 'WARNING', 'ERROR', 'SUCCESS') NOT NULL,
  userId VARCHAR(191) NOT NULL,
  isRead BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Audit Logs table
CREATE TABLE audit_logs (
  id VARCHAR(191) PRIMARY KEY,
  action VARCHAR(191) NOT NULL,
  entityType VARCHAR(191) NOT NULL,
  entityId VARCHAR(191) NOT NULL,
  oldValues TEXT DEFAULT '{}', -- JSON string
  newValues TEXT DEFAULT '{}', -- JSON string
  userId VARCHAR(191) NOT NULL,
  ipAddress VARCHAR(191),
  userAgent TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_students_registration ON students(registrationNumber);
CREATE INDEX idx_students_class ON students(classId);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_student ON attendance(studentId);
CREATE INDEX idx_performance_student ON performance(studentId);
CREATE INDEX idx_performance_subject ON performance(subject);
CREATE INDEX idx_results_student ON results(studentId);
CREATE INDEX idx_results_exam_type ON results(examType);
CREATE INDEX idx_announcements_status ON announcements(status);
CREATE INDEX idx_announcements_type ON announcements(type);
CREATE INDEX idx_events_date ON events(eventDate);
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_notifications_user ON notifications(userId);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entityType, entityId);
CREATE INDEX idx_audit_logs_user ON audit_logs(userId);