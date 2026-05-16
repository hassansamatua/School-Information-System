# Database Schema Documentation

This document provides comprehensive documentation for the School Information System database schema, including tables, relationships, indexes, and data flow.

## Table of Contents

- [Overview](#overview)
- [Database Configuration](#database-configuration)
- [Schema Diagram](#schema-diagram)
- [Tables](#tables)
- [Relationships](#relationships)
- [Indexes](#indexes)
- [Constraints](#constraints)
- [Data Flow](#data-flow)
- [Migration Guide](#migration-guide)
- [Backup and Recovery](#backup-and-recovery)

## Overview

The School Information System uses a MySQL database with a comprehensive schema designed to support multi-role functionality, approval workflows, and complete school management operations.

### Database Features
- **Multi-tenant architecture** with role-based access
- **Approval workflow system** for content control
- **Audit logging** for security and compliance
- **Soft delete** for data integrity
- **Timestamp tracking** for all records
- **Foreign key constraints** for data consistency

## Database Configuration

### Prisma Configuration
```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

### Connection String Format
```
mysql://username:password@host:port/database
```

### Environment Variables
```env
DATABASE_URL="mysql://root:@localhost:3306/school_information_system"
```

## Schema Diagram

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Users    │    │    Admins   │    │  Teachers   │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ email       │    │ userId (FK) │    │ userId (FK) │
│ name        │    │ permissions │    │ specialization │
│ role        │    │ createdAt   │    │ qualification │
│ password    │    │ updatedAt   │    │ phone       │
│ createdAt   │    └─────────────┘    │ createdAt   │
│ updatedAt   │                      │ updatedAt   │
└─────────────┘                      └─────────────┘
       │                                    │
       │                                    │
       ▼                                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Parents   │    │  Students   │    │   Classes   │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ userId (FK) │    │ name        │    │ name        │
│ phone       │    │ email       │    │ section     │
│ address     │    │ rollNumber  │    │ grade       │
│ createdAt   │    │ classId (FK)│    │ teacherId(FK)│
│ updatedAt   │    │ parentId(FK)│    │ capacity    │
└─────────────┘    │ dateOfBirth │    │ createdAt   │
       │           │ gender      │    │ updatedAt   │
       │           │ status      │    └─────────────┘
       │           │ createdAt   │           │
       │           │ updatedAt   │           │
       │           └─────────────┘           │
       │                  │                │
       │                  │                │
       ▼                  ▼                ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Attendance  │    │Performance  │    │  Results    │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ studentId(FK)│   │ studentId(FK)│   │ studentId(FK)│
│ classId (FK)│   │ subject     │    │ examName    │
│ date        │    │ assessment  │    │ examType    │
│ status      │    │ score       │    │ totalScore  │
│ remarks     │    │ maxScore    │    │ maxTotal    │
│ recordedBy(FK)│  │ grade       │    │ percentage  │
│ createdAt   │    │ date        │    │ grade       │
│ updatedAt   │    │ remarks     │    │ rank        │
└─────────────┘    │ recordedBy(FK)│   │ classRank   │
       │           │ createdAt   │    │ status      │
       │           │ updatedAt   │    │ publishedAt │
       │           └─────────────┘    │ createdAt   │
       │                  │           │ updatedAt   │
       │                  │           └─────────────┘
       │                  │                  │
       │                  │                  │
       ▼                  ▼                  ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Submissions │    │ Announcements│    │   Events    │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ type        │    │ title       │    │ title       │
│ submittedBy(FK)│ │ content     │    │ description │
│ data        │    │ targetAudience│   │ date        │
│ status      │    │ priority    │    │ time        │
│ submittedAt │    │ scheduledFor│   │ location    │
│ processedAt │    │ expiresAt   │    │ targetAudience│
│ processedBy(FK)│ │ createdBy(FK)│   │ registration│
│ createdAt   │    │ createdAt   │    │ createdBy(FK)│
│ updatedAt   │    │ updatedAt   │    │ createdAt   │
└─────────────┘    └─────────────┘    │ updatedAt   │
       │                                    │
       │                                    │
       ▼                                    ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ Approvals   │    │ Notifications│    │ Reports     │
├─────────────┤    ├─────────────┤    ├─────────────┤
│ id (PK)     │    │ id (PK)     │    │ id (PK)     │
│ submissionId(FK)│ │ userId (FK) │    │ type        │
│ type        │    │ title       │    │ title       │
│ status      │    │ message     │    │ description │
│ submittedBy(FK)│ │ type        │    │ parameters  │
│ processedBy(FK)│ │ priority    │    │ generatedBy(FK)│
│ submittedAt │    │ read        │    │ filePath    │
│ processedAt │    │ createdAt   │    │ createdAt   │
│ comments    │    │ updatedAt   │    │ updatedAt   │
│ createdAt   │    └─────────────┘    └─────────────┘
│ updatedAt   │           │
└─────────────┘           │
       │                  │
       ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│                   Audit Logs                           │
├─────────────────────────────────────────────────────────┤
│ id (PK)                                                │
│ userId (FK)                                            │
│ action                                                 │
│ entityType                                             │
│ entityId                                               │
│ oldValues                                              │
│ newValues                                              │
│ ipAddress                                              │
│ userAgent                                              │
│ createdAt                                              │
└─────────────────────────────────────────────────────────┘
```

## Tables

### Users Table
Central authentication table for all user types.

```sql
CREATE TABLE users (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  email VARCHAR(191) NOT NULL UNIQUE,
  name VARCHAR(191) NOT NULL,
  role ENUM('admin', 'teacher', 'parent') NOT NULL,
  password VARCHAR(191) NOT NULL,
  image VARCHAR(191),
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
);
```

**Fields:**
- `id`: Unique identifier (UUID)
- `email`: User email (unique)
- `name`: Full name
- `role`: User role (admin/teacher/parent)
- `password`: Hashed password
- `image`: Profile image URL
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email`
- INDEX on `role`

### Admins Table
Extended profile for admin users.

```sql
CREATE TABLE admins (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  userId VARCHAR(191) NOT NULL UNIQUE,
  permissions JSON,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

**Fields:**
- `id`: Unique identifier
- `userId`: Reference to Users table
- `permissions`: JSON object with admin permissions
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Teachers Table
Extended profile for teacher users.

```sql
CREATE TABLE teachers (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  userId VARCHAR(191) NOT NULL UNIQUE,
  specialization VARCHAR(191),
  qualification VARCHAR(191),
  phone VARCHAR(191),
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

**Fields:**
- `id`: Unique identifier
- `userId`: Reference to Users table
- `specialization`: Subject specialization
- `qualification`: Academic qualifications
- `phone`: Contact number
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Parents Table
Extended profile for parent users.

```sql
CREATE TABLE parents (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  userId VARCHAR(191) NOT NULL UNIQUE,
  phone VARCHAR(191),
  address TEXT,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

**Fields:**
- `id`: Unique identifier
- `userId`: Reference to Users table
- `phone`: Contact number
- `address`: Home address
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

### Students Table
Student records and enrollment information.

```sql
CREATE TABLE students (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  email VARCHAR(191) UNIQUE,
  rollNumber VARCHAR(191) NOT NULL,
  classId VARCHAR(191) NOT NULL,
  parentId VARCHAR(191),
  dateOfBirth DATETIME(3),
  gender ENUM('male', 'female'),
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (parentId) REFERENCES parents(id) ON DELETE SET NULL
);
```

**Fields:**
- `id`: Unique identifier
- `name`: Student name
- `email`: Student email (optional)
- `rollNumber`: Unique roll number
- `classId`: Reference to Classes table
- `parentId`: Reference to Parents table
- `dateOfBirth`: Date of birth
- `gender`: Gender (male/female)
- `status`: Enrollment status (active/inactive)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `rollNumber`
- INDEX on `classId`
- INDEX on `parentId`
- INDEX on `status`

### Classes Table
Class organization and teacher assignment.

```sql
CREATE TABLE classes (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  name VARCHAR(191) NOT NULL,
  section VARCHAR(191),
  grade VARCHAR(191) NOT NULL,
  teacherId VARCHAR(191),
  capacity INT NOT NULL DEFAULT 40,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (teacherId) REFERENCES teachers(id) ON DELETE SET NULL
);
```

**Fields:**
- `id`: Unique identifier
- `name`: Class name (e.g., "Class 10A")
- `section`: Class section (A, B, C, etc.)
- `grade`: Grade level
- `teacherId`: Assigned teacher
- `capacity`: Maximum student capacity
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `teacherId`
- INDEX on `grade`

### Attendance Table
Daily attendance records.

```sql
CREATE TABLE attendance (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  studentId VARCHAR(191) NOT NULL,
  classId VARCHAR(191) NOT NULL,
  date DATE NOT NULL,
  status ENUM('present', 'absent', 'late') NOT NULL,
  remarks TEXT,
  recordedBy VARCHAR(191) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (classId) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (recordedBy) REFERENCES users(id) ON DELETE CASCADE
);
```

**Fields:**
- `id`: Unique identifier
- `studentId`: Reference to Students table
- `classId`: Reference to Classes table
- `date`: Attendance date
- `status`: Attendance status (present/absent/late)
- `remarks`: Optional remarks
- `recordedBy`: User who recorded attendance
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `studentId`, `classId`, `date`
- INDEX on `date`
- INDEX on `status`

### Performance Table
Student performance and assessment records.

```sql
CREATE TABLE performance (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  studentId VARCHAR(191) NOT NULL,
  subject VARCHAR(191) NOT NULL,
  assessmentType VARCHAR(191) NOT NULL,
  score INT NOT NULL,
  maxScore INT NOT NULL,
  grade VARCHAR(191),
  date DATE NOT NULL,
  remarks TEXT,
  recordedBy VARCHAR(191) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (recordedBy) REFERENCES users(id) ON DELETE CASCADE
);
```

**Fields:**
- `id`: Unique identifier
- `studentId`: Reference to Students table
- `subject`: Subject name
- `assessmentType`: Type of assessment (quiz, test, assignment, project, exam)
- `score`: Obtained score
- `maxScore`: Maximum possible score
- `grade`: Calculated grade
- `date`: Assessment date
- `remarks`: Optional remarks
- `recordedBy`: User who recorded performance
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `studentId`
- INDEX on `subject`
- INDEX on `assessmentType`
- INDEX on `date`

### Results Table
Official examination results.

```sql
CREATE TABLE results (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  studentId VARCHAR(191) NOT NULL,
  examName VARCHAR(191) NOT NULL,
  examType VARCHAR(191) NOT NULL,
  totalScore INT NOT NULL,
  maxTotalScore INT NOT NULL,
  percentage DECIMAL(5,2) NOT NULL,
  grade VARCHAR(191) NOT NULL,
  rank INT,
  classRank INT,
  status ENUM('draft', 'published') NOT NULL DEFAULT 'draft',
  publishedAt DATETIME(3),
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (studentId) REFERENCES students(id) ON DELETE CASCADE
);
```

**Fields:**
- `id`: Unique identifier
- `studentId`: Reference to Students table
- `examName`: Examination name
- `examType`: Type of examination (midterm, final, etc.)
- `totalScore`: Total obtained score
- `maxTotalScore`: Maximum possible score
- `percentage`: Percentage score
- `grade`: Final grade
- `rank`: Overall rank
- `classRank`: Class rank
- `status`: Publication status (draft/published)
- `publishedAt`: Publication timestamp
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `studentId`
- INDEX on `examType`
- INDEX on `status`
- INDEX on `percentage`

### Submissions Table
Teacher submissions for approval workflow.

```sql
CREATE TABLE submissions (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  type VARCHAR(191) NOT NULL,
  submittedBy VARCHAR(191) NOT NULL,
  data JSON NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  submittedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  processedAt DATETIME(3),
  processedBy VARCHAR(191),
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (submittedBy) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (processedBy) REFERENCES users(id) ON DELETE SET NULL
);
```

**Fields:**
- `id`: Unique identifier
- `type`: Submission type (attendance, performance, announcement, event)
- `submittedBy`: User who submitted
- `data`: JSON data for the submission
- `status`: Approval status (pending/approved/rejected)
- `submittedAt`: Submission timestamp
- `processedAt`: Processing timestamp
- `processedBy`: User who processed
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `submittedBy`
- INDEX on `type`
- INDEX on `status`
- INDEX on `submittedAt`

### Approvals Table
Approval workflow tracking.

```sql
CREATE TABLE approvals (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  submissionId VARCHAR(191) NOT NULL UNIQUE,
  type VARCHAR(191) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  submittedBy VARCHAR(191) NOT NULL,
  processedBy VARCHAR(191),
  submittedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  processedAt DATETIME(3),
  comments TEXT,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (submissionId) REFERENCES submissions(id) ON DELETE CASCADE,
  FOREIGN KEY (submittedBy) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (processedBy) REFERENCES users(id) ON DELETE SET NULL
);
```

**Fields:**
- `id`: Unique identifier
- `submissionId`: Reference to Submissions table
- `type`: Approval type
- `status`: Approval status
- `submittedBy`: User who submitted
- `processedBy`: User who processed
- `submittedAt`: Submission timestamp
- `processedAt`: Processing timestamp
- `comments`: Processing comments
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Indexes:**
- PRIMARY KEY on `id`
- UNIQUE INDEX on `submissionId`
- INDEX on `submittedBy`
- INDEX on `processedBy`
- INDEX on `status`

### Announcements Table
School announcements.

```sql
CREATE TABLE announcements (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  title VARCHAR(191) NOT NULL,
  content TEXT NOT NULL,
  targetAudience JSON NOT NULL,
  priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  scheduledFor DATETIME(3),
  expiresAt DATETIME(3),
  createdBy VARCHAR(191) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
);
```

**Fields:**
- `id`: Unique identifier
- `title`: Announcement title
- `content`: Announcement content
- `targetAudience`: JSON array of target roles
- `priority`: Priority level (low/medium/high)
- `scheduledFor`: Scheduled publication time
- `expiresAt`: Expiration time
- `createdBy`: User who created
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `createdBy`
- INDEX on `priority`
- INDEX on `scheduledFor`

### Events Table
School events.

```sql
CREATE TABLE events (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  title VARCHAR(191) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME,
  location VARCHAR(191),
  targetAudience JSON NOT NULL,
  registrationRequired BOOLEAN NOT NULL DEFAULT false,
  createdBy VARCHAR(191) NOT NULL,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE CASCADE
);
```

**Fields:**
- `id`: Unique identifier
- `title`: Event title
- `description`: Event description
- `date`: Event date
- `time`: Event time
- `location`: Event location
- `targetAudience`: JSON array of target roles
- `registrationRequired`: Whether registration is required
- `createdBy`: User who created
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `createdBy`
- INDEX on `date`

### Notifications Table
User notifications.

```sql
CREATE TABLE notifications (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  userId VARCHAR(191) NOT NULL,
  title VARCHAR(191) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(191) NOT NULL,
  priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  read BOOLEAN NOT NULL DEFAULT false,
  data JSON,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);
```

**Fields:**
- `id`: Unique identifier
- `userId`: Reference to Users table
- `title`: Notification title
- `message`: Notification message
- `type`: Notification type
- `priority`: Priority level
- `read`: Read status
- `data`: Additional data (JSON)
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `userId`
- INDEX on `read`
- INDEX on `type`
- INDEX on `priority`

### Reports Table
Generated reports.

```sql
CREATE TABLE reports (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  type VARCHAR(191) NOT NULL,
  title VARCHAR(191) NOT NULL,
  description TEXT,
  parameters JSON NOT NULL,
  generatedBy VARCHAR(191) NOT NULL,
  filePath VARCHAR(191),
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  updatedAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  FOREIGN KEY (generatedBy) REFERENCES users(id) ON DELETE CASCADE
);
```

**Fields:**
- `id`: Unique identifier
- `type`: Report type
- `title`: Report title
- `description`: Report description
- `parameters`: Report parameters (JSON)
- `generatedBy`: User who generated
- `filePath`: File path
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `generatedBy`
- INDEX on `type`

### AuditLogs Table
System audit logs.

```sql
CREATE TABLE auditLogs (
  id VARCHAR(191) NOT NULL PRIMARY KEY,
  userId VARCHAR(191),
  action VARCHAR(191) NOT NULL,
  entityType VARCHAR(191) NOT NULL,
  entityId VARCHAR(191) NOT NULL,
  oldValues JSON,
  newValues JSON,
  ipAddress VARCHAR(191),
  userAgent TEXT,
  createdAt DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
);
```

**Fields:**
- `id`: Unique identifier
- `userId`: Reference to Users table (optional)
- `action`: Action performed
- `entityType`: Type of entity affected
- `entityId`: ID of entity affected
- `oldValues`: Previous values (JSON)
- `newValues`: New values (JSON)
- `ipAddress`: IP address
- `userAgent`: User agent string
- `createdAt`: Creation timestamp

**Indexes:**
- PRIMARY KEY on `id`
- INDEX on `userId`
- INDEX on `action`
- INDEX on `entityType`
- INDEX on `createdAt`

## Relationships

### One-to-One Relationships
- `Users` ↔ `Admins` (1:1)
- `Users` ↔ `Teachers` (1:1)
- `Users` ↔ `Parents` (1:1)

### One-to-Many Relationships
- `Classes` → `Students` (1:N)
- `Parents` → `Students` (1:N)
- `Teachers` → `Classes` (1:N)
- `Students` → `Attendance` (1:N)
- `Students` → `Performance` (1:N)
- `Students` → `Results` (1:N)
- `Users` → `Submissions` (1:N)
- `Submissions` → `Approvals` (1:1)
- `Users` → `Notifications` (1:N)
- `Users` → `Reports` (1:N)
- `Users` → `AuditLogs` (1:N)

### Many-to-Many Relationships
- `Users` ↔ `Classes` (through Teachers table)
- `Users` ↔ `Students` (through Parents table)

## Indexes

### Primary Keys
All tables have primary keys on `id` fields (VARCHAR(191)).

### Unique Indexes
- `users.email` - Unique email addresses
- `attendance.studentId, classId, date` - Unique attendance records
- `submissions.submissionId` - Unique submission references
- `students.rollNumber` - Unique roll numbers

### Foreign Key Indexes
- All foreign key fields are indexed for performance
- Composite indexes on frequently queried combinations

### Performance Indexes
- `attendance.date` - For date-based queries
- `performance.date` - For performance date ranges
- `results.percentage` - For result ranking
- `notifications.read` - For unread notifications
- `auditLogs.createdAt` - For audit log queries

## Constraints

### Foreign Key Constraints
- All foreign keys have appropriate ON DELETE/UPDATE actions
- CASCADE for dependent relationships
- SET NULL for optional relationships
- RESTRICT for critical relationships

### Check Constraints
- `performance.score` >= 0 AND <= `performance.maxScore`
- `results.totalScore` >= 0 AND <= `results.maxTotalScore`
- `results.percentage` >= 0 AND <= 100
- `classes.capacity` > 0

### Default Values
- Timestamp fields default to CURRENT_TIMESTAMP(3)
- Boolean fields default to false
- Status fields have appropriate defaults
- Role fields have required values

## Data Flow

### Registration Flow
1. User creates account in `Users` table
2. Role-specific record created (`Admins`, `Teachers`, or `Parents`)
3. Audit log entry created

### Approval Workflow
1. Teacher creates submission in `Submissions` table
2. Approval record created in `Approvals` table
3. Admin processes approval
4. If approved, data moved to appropriate tables
5. Audit log entries created for each step

### Attendance Flow
1. Teacher records attendance (submission)
2. Admin approves attendance submission
3. Approved data moved to `Attendance` table
4. Parents can view attendance
5. Audit log tracks all changes

### Performance Flow
1. Teacher records performance (submission)
2. Admin approves performance submission
3. Approved data moved to `Performance` table
4. Parents can view performance
5. Grade calculation and statistics updated

### Results Flow
1. Admin creates examination results
2. Results stored in `Results` table
3. Status set to 'draft'
4. Admin publishes results (status changed to 'published')
5. Parents can view published results
6. Rankings calculated automatically

## Migration Guide

### Creating Initial Database
```bash
# Generate Prisma client
npx prisma generate

# Create database schema
npx prisma db push

# Seed initial data
npx prisma db seed
```

### Adding New Tables
1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name add_new_table`
3. Update application code
4. Test migration

### Modifying Existing Tables
1. Update `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name modify_table`
3. Handle data migration if needed
4. Update application code
5. Test thoroughly

### Production Migrations
```bash
# Generate client
npx prisma generate

# Apply migrations
npx prisma migrate deploy

# Verify migration
npx prisma db pull
```

## Backup and Recovery

### Manual Backup
```bash
# Full database backup
mysqldump -u root -p school_information_system > backup_$(date +%Y%m%d).sql

# Specific tables backup
mysqldump -u root -p school_information_system users teachers parents > users_backup.sql
```

### Automated Backup
```bash
# Create backup script
#!/bin/bash
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u root -p school_information_system > $BACKUP_DIR/backup_$DATE.sql

# Clean old backups (keep last 30 days)
find $BACKUP_DIR -name "backup_*.sql" -mtime +30 -delete
```

### Recovery
```bash
# Restore from backup
mysql -u root -p school_information_system < backup_20240101.sql

# Restore specific tables
mysql -u root -p school_information_system < users_backup.sql
```

### Data Validation
```sql
-- Check table counts
SELECT 
  TABLE_NAME,
  TABLE_ROWS
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'school_information_system';

-- Check data integrity
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM students;
SELECT COUNT(*) FROM attendance;
```

---

This database schema documentation provides comprehensive information about the School Information System database structure and operations. For additional information, refer to the API documentation and application code.