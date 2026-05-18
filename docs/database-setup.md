# Database Setup Guide

## Overview
This project uses direct MySQL connection with XAMPP instead of Prisma ORM for better performance and control over database operations.

## Prerequisites
- XAMPP with MySQL/MariaDB installed and running
- Node.js and npm installed
- MySQL credentials (default: root/hansco123)

## Database Configuration

### Environment Variables
Update your `.env` file with the following MySQL configuration:

```env
# Direct MySQL Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=hansco123
DB_NAME=school_information_system
DB_PORT=3306
```

## Database Setup Commands

### 1. Setup Database and Tables
```bash
npm run db:setup
```

### 2. Seed Initial Data
```bash
npm run db:seed
```

### 3. Reset Database (Setup + Seed)
```bash
npm run db:reset
```

## Database Schema

The database includes the following tables:

### Core Tables
- `users` - User authentication and roles
- `admins` - Administrator profiles
- `teachers` - Teacher profiles
- `parents` - Parent profiles
- `students` - Student records
- `classes` - Class information (Form 1-4, Streams A-D)

### Academic Tables
- `attendance` - Student attendance records
- `performance` - Academic performance data
- `results` - Exam results and reports

### Management Tables
- `announcements` - School announcements
- `events` - School events
- `submissions` - Content submissions
- `approvals` - Approval workflows
- `reports` - Generated reports
- `notifications` - User notifications
- `audit_logs` - Audit trail

## Default Login Credentials

After running the seed script, you can use these credentials:

- **Admin**: admin@school.edu / admin123
- **Teacher**: teacher@school.edu / teacher123
- **Parent**: parent@school.edu / parent123

## Database Connection

The application uses a connection pool for optimal performance:

```typescript
import { executeQuery, testConnection } from '@/lib/mysql'

// Test connection
const isConnected = await testConnection()

// Execute query
const users = await executeQuery('SELECT * FROM users WHERE role = ?', ['ADMIN'])
```

## Manual Database Operations

### Connect to MySQL via Command Line
```bash
cd c:\xampp\mysql\bin
mysql.exe -u root -phansco123 school_information_system
```

### Common SQL Commands
```sql
-- View all tables
SHOW TABLES;

-- View table structure
DESCRIBE users;

-- View all users
SELECT * FROM users;

-- View classes with student count
SELECT 
  c.name,
  c.form,
  c.stream,
  COUNT(s.id) as student_count
FROM classes c
LEFT JOIN students s ON c.id = s.classId
GROUP BY c.id
ORDER BY c.form, c.stream;
```

## Troubleshooting

### Database Connection Issues
1. Ensure XAMPP MySQL service is running
2. Verify credentials in `.env` file
3. Check if database exists: `SHOW DATABASES;`

### Permission Issues
1. Make sure MySQL user has proper permissions
2. Check if database user can create tables

### Port Conflicts
1. Ensure MySQL is running on port 3306
2. Check for other services using the same port

## Migration from Prisma

If you're migrating from Prisma:

1. Remove Prisma dependencies: `npm uninstall @prisma/client prisma`
2. Install mysql2: `npm install mysql2`
3. Update API endpoints to use direct MySQL queries
4. Remove `prisma` directory and related files

## Performance Considerations

- Connection pooling is configured for optimal performance
- Use parameterized queries to prevent SQL injection
- Consider adding indexes for frequently queried columns
- Monitor connection pool usage in production

## Security Notes

- Never commit database credentials to version control
- Use environment variables for sensitive data
- Implement proper user authentication and authorization
- Regularly update MySQL/MariaDB for security patches