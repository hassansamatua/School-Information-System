// User Roles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  PARENT: 'PARENT',
} as const;

// User Status
export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
} as const;

// Attendance Status
export const ATTENDANCE_STATUS = {
  PRESENT: 'PRESENT',
  ABSENT: 'ABSENT',
  LATE: 'LATE',
  EXCUSED: 'EXCUSED',
} as const;

// Gender
export const GENDER = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
} as const;

// Assessment Types
export const ASSESSMENT_TYPES = {
  QUIZ: 'QUIZ',
  TEST: 'TEST',
  ASSIGNMENT: 'ASSIGNMENT',
  PROJECT: 'PROJECT',
  EXAM: 'EXAM',
} as const;

// Exam Types
export const EXAM_TYPES = {
  MIDTERM: 'MIDTERM',
  FINAL: 'FINAL',
  UNIT_TEST: 'UNIT_TEST',
  PRACTICAL: 'PRACTICAL',
} as const;

// Announcement Types
export const ANNOUNCEMENT_TYPES = {
  GENERAL: 'GENERAL',
  URGENT: 'URGENT',
  ACADEMIC: 'ACADEMIC',
  EVENT: 'EVENT',
} as const;

// Event Types
export const EVENT_TYPES = {
  ACADEMIC: 'ACADEMIC',
  SPORTS: 'SPORTS',
  CULTURAL: 'CULTURAL',
  MEETING: 'MEETING',
  HOLIDAY: 'HOLIDAY',
} as const;

// Target Audience
export const TARGET_AUDIENCE = {
  ALL: 'ALL',
  TEACHERS: 'TEACHERS',
  PARENTS: 'PARENTS',
  SPECIFIC_CLASS: 'SPECIFIC_CLASS',
  SPECIFIC_STUDENT: 'SPECIFIC_STUDENT',
} as const;

// Submission Status
export const SUBMISSION_STATUS = {
  DRAFT: 'DRAFT',
  PENDING_APPROVAL: 'PENDING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'INFO',
  SUCCESS: 'SUCCESS',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
} as const;

// Report Types
export const REPORT_TYPES = {
  ATTENDANCE: 'ATTENDANCE',
  PERFORMANCE: 'PERFORMANCE',
  RESULTS: 'RESULTS',
  STUDENT_LIST: 'STUDENT_LIST',
  TEACHER_ACTIVITY: 'TEACHER_ACTIVITY',
  PARENT_LIST: 'PARENT_LIST',
} as const;

// Report Status
export const REPORT_STATUS = {
  GENERATING: 'GENERATING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// File Upload
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

// Date Formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
  TIME: 'HH:mm',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
  },
  ADMIN: {
    DASHBOARD: '/api/admin/dashboard',
    TEACHERS: '/api/admin/teachers',
    PARENTS: '/api/admin/parents',
    STUDENTS: '/api/admin/students',
    CLASSES: '/api/admin/classes',
    APPROVALS: '/api/admin/approvals',
    REPORTS: '/api/admin/reports',
  },
  TEACHER: {
    DASHBOARD: '/api/teacher/dashboard',
    ATTENDANCE: '/api/teacher/attendance',
    PERFORMANCE: '/api/teacher/performance',
    SUBMISSIONS: '/api/teacher/submissions',
    CLASSES: '/api/teacher/classes',
  },
  PARENT: {
    DASHBOARD: '/api/parent/dashboard',
    STUDENTS: '/api/parent/students',
    ATTENDANCE: '/api/parent/attendance',
    PERFORMANCE: '/api/parent/performance',
    RESULTS: '/api/parent/results',
    ANNOUNCEMENTS: '/api/parent/announcements',
    EVENTS: '/api/parent/events',
  },
  NOTIFICATIONS: '/api/notifications',
  UPLOAD: '/api/upload',
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ADMIN: {
    DASHBOARD: '/admin',
    TEACHERS: '/admin/teachers',
    PARENTS: '/admin/parents',
    STUDENTS: '/admin/students',
    CLASSES: '/admin/classes',
    APPROVALS: '/admin/approvals',
    REPORTS: '/admin/reports',
    SETTINGS: '/admin/settings',
    ANNOUNCEMENTS: '/admin/announcements',
    EVENTS: '/admin/events',
  },
  TEACHER: {
    DASHBOARD: '/teacher',
    ATTENDANCE: '/teacher/attendance',
    PERFORMANCE: '/teacher/performance',
    SUBMISSIONS: '/teacher/submissions',
    CLASSES: '/teacher/classes',
    PROFILE: '/teacher/profile',
  },
  PARENT: {
    DASHBOARD: '/parent',
    STUDENTS: '/parent/students',
    ATTENDANCE: '/parent/attendance',
    PERFORMANCE: '/parent/performance',
    RESULTS: '/parent/results',
    ANNOUNCEMENTS: '/parent/announcements',
    EVENTS: '/parent/events',
    PROFILE: '/parent/profile',
  },
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/unauthorized',
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PASSWORD_MIN: 'Password must be at least 8 characters long',
  PASSWORD_MATCH: 'Passwords do not match',
  PHONE: 'Please enter a valid phone number',
  NUMBER: 'Please enter a valid number',
  POSITIVE: 'Please enter a positive number',
  MAX_FILE_SIZE: 'File size must be less than 5MB',
  ALLOWED_FILE_TYPES: 'Only images, PDF, and Office documents are allowed',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful',
  LOGOUT: 'Logged out successfully',
  REGISTER: 'Registration successful',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  TEACHER_CREATED: 'Teacher created successfully',
  TEACHER_UPDATED: 'Teacher updated successfully',
  TEACHER_DELETED: 'Teacher deleted successfully',
  STUDENT_CREATED: 'Student created successfully',
  STUDENT_UPDATED: 'Student updated successfully',
  STUDENT_DELETED: 'Student deleted successfully',
  CLASS_CREATED: 'Class created successfully',
  CLASS_UPDATED: 'Class updated successfully',
  CLASS_DELETED: 'Class deleted successfully',
  ATTENDANCE_RECORDED: 'Attendance recorded successfully',
  PERFORMANCE_RECORDED: 'Performance recorded successfully',
  SUBMISSION_CREATED: 'Submission created successfully',
  APPROVAL_GRANTED: 'Approval granted successfully',
  APPROVAL_REJECTED: 'Approval rejected successfully',
  ANNOUNCEMENT_CREATED: 'Announcement created successfully',
  EVENT_CREATED: 'Event created successfully',
  NOTIFICATION_SENT: 'Notification sent successfully',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCESS_DENIED: 'Access denied',
  NOT_FOUND: 'Resource not found',
  SERVER_ERROR: 'Internal server error',
  NETWORK_ERROR: 'Network error',
  VALIDATION_ERROR: 'Validation error',
  DUPLICATE_EMAIL: 'Email already exists',
  DUPLICATE_REGISTRATION: 'Registration number already exists',
  INVALID_ROLE: 'Invalid user role',
  INACTIVE_ACCOUNT: 'Account is inactive',
  PENDING_APPROVAL: 'Account is pending approval',
  REJECTED_ACCOUNT: 'Account has been rejected',
  FILE_UPLOAD_ERROR: 'File upload failed',
  GENERATE_REPORT_ERROR: 'Failed to generate report',
} as const;

// Theme
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// Colors
export const COLORS = {
  PRIMARY: '#3b82f6',
  SECONDARY: '#64748b',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#06b6d4',
} as const;

// Breakpoints
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;