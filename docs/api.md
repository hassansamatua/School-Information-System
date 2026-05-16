# API Documentation

This document provides comprehensive API documentation for the School Information System, including authentication, endpoints, request/response formats, and error handling.

## Table of Contents

- [Authentication](#authentication)
- [Base URL](#base-url)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Authentication Endpoints](#authentication-endpoints)
- [Admin Endpoints](#admin-endpoints)
- [Teacher Endpoints](#teacher-endpoints)
- [Parent Endpoints](#parent-endpoints)
- [Common Endpoints](#common-endpoints)
- [Data Models](#data-models)
- [Rate Limiting](#rate-limiting)
- [Examples](#examples)

## Authentication

### Authentication Method
The API uses NextAuth.js for authentication with JWT tokens. All protected endpoints require a valid session.

### Authentication Headers
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Session Management
- Sessions are managed by NextAuth
- JWT tokens are automatically included in requests
- Session duration is configurable
- Automatic token refresh is handled by NextAuth

### Role-Based Access
- **Admin**: Full access to all endpoints
- **Teacher**: Access to teacher-specific endpoints
- **Parent**: Access to parent-specific endpoints

## Base URL

### Development
```
http://localhost:3000/api
```

### Production
```
https://yourdomain.com/api
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

## Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

### Error Codes
- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Authentication failed
- `AUTHORIZATION_ERROR` - Permission denied
- `NOT_FOUND` - Resource not found
- `DUPLICATE_ERROR` - Resource already exists
- `DATABASE_ERROR` - Database operation failed
- `INTERNAL_ERROR` - Internal server error

## Authentication Endpoints

### POST /api/auth/login
Authenticate user and create session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "admin|teacher|parent",
      "image": "profile_image_url"
    },
    "session": {
      "expires": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### POST /api/auth/register
Register new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "parent",
  "phone": "1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "john@example.com",
      "name": "John Doe",
      "role": "parent"
    }
  }
}
```

### GET /api/auth/me
Get current user information.

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "name": "User Name",
      "role": "admin|teacher|parent",
      "image": "profile_image_url",
      "profile": {
        // Role-specific profile data
      }
    }
  }
}
```

### POST /api/auth/logout
Logout user and invalidate session.

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## Admin Endpoints

### GET /api/admin/dashboard
Get admin dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalStudents": 150,
      "totalTeachers": 20,
      "totalParents": 120,
      "totalClasses": 10,
      "pendingApprovals": 5,
      "recentActivity": []
    }
  }
}
```

### GET /api/admin/teachers
Get all teachers with pagination and filtering.

**Query Parameters:**
- `page` (number) - Page number (default: 1)
- `limit` (number) - Items per page (default: 10)
- `search` (string) - Search term
- `status` (string) - Filter by status

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "teacher_id",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "1234567890",
        "specialization": "Mathematics",
        "status": "active",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 20,
      "totalPages": 2
    }
  }
}
```

### POST /api/admin/teachers
Create new teacher account.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "phone": "1234567890",
  "specialization": "Science",
  "qualification": "M.Sc. Physics"
}
```

### PUT /api/admin/teachers/:id
Update teacher information.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "phone": "1234567890",
  "specialization": "Physics",
  "qualification": "M.Sc. Physics"
}
```

### DELETE /api/admin/teachers/:id
Delete teacher account.

### GET /api/admin/parents
Get all parents with pagination and filtering.

**Query Parameters:**
- `page` (number) - Page number
- `limit` (number) - Items per page
- `search` (string) - Search term

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "parent_id",
        "name": "Parent Name",
        "email": "parent@example.com",
        "phone": "1234567890",
        "address": "123 Main St",
        "children": [
          {
            "id": "student_id",
            "name": "Student Name",
            "class": "Class 10A"
          }
        ],
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### GET /api/admin/students
Get all students with pagination and filtering.

**Query Parameters:**
- `page` (number) - Page number
- `limit` (number) - Items per page
- `class` (string) - Filter by class
- `search` (string) - Search term

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "student_id",
        "name": "Student Name",
        "email": "student@example.com",
        "rollNumber": "S001",
        "class": {
          "id": "class_id",
          "name": "Class 10A",
          "section": "A"
        },
        "parent": {
          "id": "parent_id",
          "name": "Parent Name",
          "email": "parent@example.com"
        },
        "status": "active",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### POST /api/admin/students
Create new student record.

**Request Body:**
```json
{
  "name": "Student Name",
  "email": "student@example.com",
  "rollNumber": "S001",
  "classId": "class_id",
  "parentId": "parent_id",
  "dateOfBirth": "2008-01-01",
  "gender": "male"
}
```

### GET /api/admin/classes
Get all classes with pagination.

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "class_id",
        "name": "Class 10A",
        "section": "A",
        "grade": "10",
        "teacher": {
          "id": "teacher_id",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "studentCount": 30,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### POST /api/admin/classes
Create new class.

**Request Body:**
```json
{
  "name": "Class 10A",
  "section": "A",
  "grade": "10",
  "teacherId": "teacher_id",
  "capacity": 40
}
```

### GET /api/admin/approvals
Get pending and completed approvals.

**Query Parameters:**
- `status` (string) - Filter by status (pending, approved, rejected)
- `type` (string) - Filter by type (attendance, performance, announcement, event)
- `page` (number) - Page number
- `limit` (number) - Items per page

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "approval_id",
        "type": "announcement",
        "status": "pending",
        "submittedBy": {
          "id": "teacher_id",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "data": {
          "title": "School Holiday",
          "content": "School will be closed on Monday",
          "targetAudience": ["parent", "teacher"]
        },
        "submittedAt": "2024-01-01T00:00:00.000Z",
        "processedAt": null,
        "processedBy": null
      }
    ]
  }
}
```

### POST /api/admin/approvals/:id/approve
Approve a submission.

**Request Body:**
```json
{
  "comments": "Approved for publication"
}
```

### POST /api/admin/approvals/:id/reject
Reject a submission.

**Request Body:**
```json
{
  "reason": "Content needs revision"
}
```

### GET /api/admin/reports
Generate and download reports.

**Query Parameters:**
- `type` (string) - Report type (attendance, performance, results, students, teachers, parents)
- `format` (string) - Export format (pdf, excel, csv)
- `dateFrom` (string) - Start date (YYYY-MM-DD)
- `dateTo` (string) - End date (YYYY-MM-DD)
- `class` (string) - Filter by class
- `subject` (string) - Filter by subject

**Response:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "/api/admin/reports/download/report_id",
    "reportId": "report_id",
    "filename": "attendance_report_2024.pdf"
  }
}
```

### GET /api/admin/reports/download/:id
Download generated report.

**Response:** File download

## Teacher Endpoints

### GET /api/teacher/dashboard
Get teacher dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalStudents": 30,
      "todayAttendance": 28,
      "pendingSubmissions": 2,
      "recentActivity": [],
      "classes": [
        {
          "id": "class_id",
          "name": "Class 10A",
          "studentCount": 30
        }
      ]
    }
  }
}
```

### GET /api/teacher/classes
Get teacher's assigned classes.

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "class_id",
        "name": "Class 10A",
        "section": "A",
        "grade": "10",
        "studentCount": 30,
        "students": [
          {
            "id": "student_id",
            "name": "Student Name",
            "rollNumber": "S001"
          }
        ]
      }
    ]
  }
}
```

### POST /api/teacher/attendance
Record student attendance.

**Request Body:**
```json
{
  "classId": "class_id",
  "date": "2024-01-01",
  "attendance": [
    {
      "studentId": "student_id",
      "status": "present",
      "remarks": "On time"
    },
    {
      "studentId": "student_id",
      "status": "absent",
      "remarks": "Sick leave"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "submissionId": "submission_id",
    "message": "Attendance submitted for approval"
  }
}
```

### GET /api/teacher/attendance
Get attendance records.

**Query Parameters:**
- `classId` (string) - Class ID
- `dateFrom` (string) - Start date
- `dateTo` (string) - End date
- `page` (number) - Page number

### POST /api/teacher/performance
Add student performance data.

**Request Body:**
```json
{
  "studentId": "student_id",
  "subject": "Mathematics",
  "assessmentType": "quiz",
  "score": 85,
  "maxScore": 100,
  "date": "2024-01-01",
  "remarks": "Good performance"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "submissionId": "submission_id",
    "message": "Performance data submitted for approval"
  }
}
```

### GET /api/teacher/performance
Get performance records.

**Query Parameters:**
- `studentId` (string) - Student ID
- `subject` (string) - Subject
- `assessmentType` (string) - Assessment type
- `dateFrom` (string) - Start date
- `dateTo` (string) - End date

### POST /api/teacher/announcements
Create announcement (requires approval).

**Request Body:**
```json
{
  "title": "Science Project Deadline",
  "content": "Science projects must be submitted by Friday",
  "targetAudience": ["parent", "student"],
  "priority": "high",
  "scheduledFor": "2024-01-01T00:00:00.000Z"
}
```

### POST /api/teacher/events
Create event (requires approval).

**Request Body:**
```json
{
  "title": "Science Exhibition",
  "description": "Annual science exhibition for all classes",
  "date": "2024-01-15",
  "time": "10:00 AM",
  "location": "School Auditorium",
  "targetAudience": ["parent", "student"],
  "registrationRequired": true
}
```

### GET /api/teacher/submissions
Get teacher's submission history.

**Query Parameters:**
- `status` (string) - Filter by status
- `type` (string) - Filter by type
- `page` (number) - Page number

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "submission_id",
        "type": "attendance",
        "status": "approved",
        "submittedAt": "2024-01-01T00:00:00.000Z",
        "processedAt": "2024-01-01T01:00:00.000Z",
        "data": {
          // Submission data
        }
      }
    ]
  }
}
```

## Parent Endpoints

### GET /api/parent/dashboard
Get parent dashboard statistics.

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalChildren": 2,
      "todayAttendance": 2,
      "recentResults": 1,
      "unreadNotifications": 3
    },
    "children": [
      {
        "id": "student_id",
        "name": "Student Name",
        "class": "Class 10A",
        "todayAttendance": "present"
      }
    ],
    "recentActivity": []
  }
}
```

### GET /api/parent/students
Get parent's children information.

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "student_id",
        "name": "Student Name",
        "email": "student@example.com",
        "rollNumber": "S001",
        "class": {
          "id": "class_id",
          "name": "Class 10A",
          "section": "A",
          "teacher": {
            "name": "John Doe",
            "email": "john@example.com"
          }
        },
        "dateOfBirth": "2008-01-01",
        "gender": "male",
        "status": "active"
      }
    ]
  }
}
```

### GET /api/parent/students/:id
Get specific student information.

### GET /api/parent/attendance
Get children's attendance records.

**Query Parameters:**
- `studentId` (string) - Student ID (optional)
- `dateFrom` (string) - Start date
- `dateTo` (string) - End date
- `page` (number) - Page number

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "attendance_id",
        "student": {
          "id": "student_id",
          "name": "Student Name",
          "class": "Class 10A"
        },
        "date": "2024-01-01",
        "status": "present",
        "remarks": "On time",
        "recordedBy": {
          "name": "John Doe",
          "email": "john@example.com"
        }
      }
    ],
    "statistics": {
      "totalDays": 20,
      "presentDays": 18,
      "absentDays": 2,
      "percentage": 90
    }
  }
}
```

### GET /api/parent/performance
Get children's performance records.

**Query Parameters:**
- `studentId` (string) - Student ID (optional)
- `subject` (string) - Subject (optional)
- `dateFrom` (string) - Start date
- `dateTo` (string) - End date

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "performance_id",
        "student": {
          "id": "student_id",
          "name": "Student Name",
          "class": "Class 10A"
        },
        "subject": "Mathematics",
        "assessmentType": "quiz",
        "score": 85,
        "maxScore": 100,
        "grade": "A",
        "date": "2024-01-01",
        "remarks": "Good performance"
      }
    ],
    "summary": {
      "totalAssessments": 10,
      "averageScore": 82,
      "bestSubject": "Mathematics",
      "needsImprovement": "Physics"
    }
  }
}
```

### GET /api/parent/results
Get children's exam results.

**Query Parameters:**
- `studentId` (string) - Student ID (optional)
- `examType` (string) - Exam type (optional)
- `dateFrom` (string) - Start date
- `dateTo` (string) - End date

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "result_id",
        "student": {
          "id": "student_id",
          "name": "Student Name",
          "class": "Class 10A"
        },
        "exam": {
          "name": "Mid-term Examination",
          "type": "midterm",
          "date": "2024-01-01"
        },
        "subjects": [
          {
            "name": "Mathematics",
            "score": 85,
            "maxScore": 100,
            "grade": "A",
            "remarks": "Excellent"
          }
        ],
        "totalScore": 425,
        "maxTotalScore": 500,
        "percentage": 85,
        "grade": "A",
        "rank": 5,
        "classRank": 3,
        "status": "published"
      }
    ]
  }
}
```

### GET /api/parent/announcements
Get approved announcements.

**Query Parameters:**
- `page` (number) - Page number
- `limit` (number) - Items per page
- `priority` (string) - Filter by priority

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "announcement_id",
        "title": "School Holiday",
        "content": "School will be closed on Monday",
        "priority": "high",
        "targetAudience": ["parent", "student"],
        "publishedAt": "2024-01-01T00:00:00.000Z",
        "publishedBy": {
          "name": "Admin",
          "email": "admin@school.edu"
        },
        "expiresAt": "2024-01-07T00:00:00.000Z"
      }
    ]
  }
}
```

### GET /api/parent/events
Get approved events.

**Query Parameters:**
- `page` (number) - Page number
- `limit` (number) - Items per page
- `dateFrom` (string) - Start date
- `dateTo` (string) - End date

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "event_id",
        "title": "Science Exhibition",
        "description": "Annual science exhibition for all classes",
        "date": "2024-01-15",
        "time": "10:00 AM",
        "location": "School Auditorium",
        "targetAudience": ["parent", "student"],
        "registrationRequired": true,
        "publishedAt": "2024-01-01T00:00:00.000Z",
        "publishedBy": {
          "name": "Admin",
          "email": "admin@school.edu"
        }
      }
    ]
  }
}
```

### GET /api/parent/notifications
Get parent notifications.

**Query Parameters:**
- `page` (number) - Page number
- `limit` (number) - Items per page
- `read` (boolean) - Filter by read status

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "notification_id",
        "title": "New Result Published",
        "message": "Mid-term results for your child have been published",
        "type": "result",
        "priority": "medium",
        "read": false,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "data": {
          "studentId": "student_id",
          "resultId": "result_id"
        }
      }
    ]
  }
}
```

### PUT /api/parent/notifications/:id/read
Mark notification as read.

## Common Endpoints

### GET /api/common/subjects
Get available subjects.

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "subject_id",
        "name": "Mathematics",
        "code": "MATH",
        "description": "Mathematics subject"
      }
    ]
  }
}
```

### GET /api/common/assessment-types
Get assessment types.

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "quiz",
        "name": "Quiz",
        "description": "Short assessment test"
      },
      {
        "id": "test",
        "name": "Test",
        "description": "Formal test assessment"
      },
      {
        "id": "assignment",
        "name": "Assignment",
        "description": "Homework assignment"
      },
      {
        "id": "project",
        "name": "Project",
        "description": "Project work"
      },
      {
        "id": "exam",
        "name": "Exam",
        "description": "Formal examination"
      }
    ]
  }
}
```

### GET /api/common/grades
Get grade system.

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "grade": "A+",
        "minScore": 90,
        "maxScore": 100,
        "description": "Excellent"
      },
      {
        "grade": "A",
        "minScore": 80,
        "maxScore": 89,
        "description": "Very Good"
      }
    ]
  }
}
```

## Data Models

### User Model
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'teacher' | 'parent';
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Student Model
```typescript
interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  classId: string;
  parentId: string;
  dateOfBirth: Date;
  gender: 'male' | 'female';
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}
```

### Class Model
```typescript
interface Class {
  id: string;
  name: string;
  section: string;
  grade: string;
  teacherId: string;
  capacity: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Attendance Model
```typescript
interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: Date;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Performance Model
```typescript
interface Performance {
  id: string;
  studentId: string;
  subject: string;
  assessmentType: string;
  score: number;
  maxScore: number;
  grade: string;
  date: Date;
  remarks?: string;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Rate Limiting

### Rate Limits
- **Authentication endpoints**: 5 requests per minute
- **Data endpoints**: 100 requests per minute
- **Upload endpoints**: 10 requests per minute
- **Export endpoints**: 5 requests per minute

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

### Rate Limit Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later."
  }
}
```

## Examples

### JavaScript/TypeScript Example
```typescript
// Login
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  return data;
};

// Get dashboard stats
const getDashboard = async () => {
  const response = await fetch('/api/admin/dashboard', {
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  return data;
};

// Record attendance
const recordAttendance = async (attendanceData: any) => {
  const response = await fetch('/api/teacher/attendance', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(attendanceData),
  });
  
  const data = await response.json();
  return data;
};
```

### cURL Examples
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@school.edu","password":"admin123"}'

# Get teachers
curl -X GET http://localhost:3000/api/admin/teachers \
  -H "Authorization: Bearer <token>"

# Record attendance
curl -X POST http://localhost:3000/api/teacher/attendance \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"classId":"class_id","date":"2024-01-01","attendance":[{"studentId":"student_id","status":"present"}]}'
```

---

This API documentation provides comprehensive information for integrating with the School Information System. For additional support, please refer to the troubleshooting section or create an issue in the repository.