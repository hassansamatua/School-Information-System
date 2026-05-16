// User and Role Types
export type UserRole = 'ADMIN' | 'TEACHER' | 'PARENT';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Admin {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  user: User;
}

export interface Teacher {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  employeeId: string;
  department?: string;
  isActive: boolean;
  user: User;
}

export interface Parent {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone?: string;
  occupation?: string;
  address?: string;
  isApproved: boolean;
  user: User;
}

// Student and Class Types
export interface Student {
  id: string;
  registrationNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE';
  address?: string;
  phone?: string;
  email?: string;
  classId?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  class?: Class;
  parent?: Parent;
}

export interface Class {
  id: string;
  name: string;
  grade: string;
  section?: string;
  teacherId?: string;
  maxStudents: number;
  currentStudents: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  teacher?: Teacher;
  students?: Student[];
}

// Academic Types
export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: Date;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
  student: Student;
  class: Class;
}

export interface Performance {
  id: string;
  studentId: string;
  classId: string;
  subject: string;
  assessmentType: 'QUIZ' | 'TEST' | 'ASSIGNMENT' | 'PROJECT' | 'EXAM';
  score: number;
  maxScore: number;
  grade?: string;
  remarks?: string;
  assessmentDate: Date;
  recordedBy: string;
  createdAt: Date;
  updatedAt: Date;
  student: Student;
  class: Class;
}

export interface Result {
  id: string;
  studentId: string;
  classId: string;
  examType: 'MIDTERM' | 'FINAL' | 'UNIT_TEST' | 'PRACTICAL';
  term: string;
  academicYear: string;
  subjects: ResultSubject[];
  totalMarks: number;
  maxTotalMarks: number;
  percentage: number;
  grade: string;
  rank?: number;
  remarks?: string;
  publishedBy: string;
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  student: Student;
  class: Class;
}

export interface ResultSubject {
  subject: string;
  marks: number;
  maxMarks: number;
  grade: string;
  remarks?: string;
}

// Communication Types
export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'GENERAL' | 'URGENT' | 'ACADEMIC' | 'EVENT';
  targetAudience: 'ALL' | 'TEACHERS' | 'PARENTS' | 'SPECIFIC_CLASS' | 'SPECIFIC_STUDENT';
  targetId?: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  postedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  publishedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  attachments?: string[];
  postedByUser: User;
  approvedByUser?: User;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  type: 'ACADEMIC' | 'SPORTS' | 'CULTURAL' | 'MEETING' | 'HOLIDAY';
  startDate: Date;
  endDate: Date;
  location?: string;
  targetAudience: 'ALL' | 'TEACHERS' | 'PARENTS' | 'SPECIFIC_CLASS' | 'SPECIFIC_STUDENT';
  targetId?: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  postedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  attachments?: string[];
  postedByUser: User;
  approvedByUser?: User;
}

// Approval Workflow Types
export interface Submission {
  id: string;
  type: 'ANNOUNCEMENT' | 'EVENT' | 'ATTENDANCE' | 'PERFORMANCE';
  title: string;
  content: string;
  data: any; // JSON data for the specific submission type
  targetAudience: 'ALL' | 'TEACHERS' | 'PARENTS' | 'SPECIFIC_CLASS' | 'SPECIFIC_STUDENT';
  targetId?: string;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  submittedBy: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
  submittedByUser: User;
  reviewedByUser?: User;
}

export interface Approval {
  id: string;
  submissionId: string;
  status: 'APPROVED' | 'REJECTED';
  comments?: string;
  approvedBy: string;
  approvedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  submission: Submission;
  approvedByUser: User;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  title: string;
  message: string;
  isRead: boolean;
  actionUrl?: string;
  actionText?: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}

// Reports Types
export interface Report {
  id: string;
  name: string;
  type: 'ATTENDANCE' | 'PERFORMANCE' | 'RESULTS' | 'STUDENT_LIST' | 'TEACHER_ACTIVITY' | 'PARENT_LIST';
  parameters: any; // JSON object with report parameters
  generatedBy: string;
  generatedAt: Date;
  fileUrl?: string;
  fileSize?: number;
  status: 'GENERATING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
  generatedByUser: User;
}

// Audit Types
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
  user: User;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface TeacherFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  employeeId: string;
  department?: string;
}

export interface StudentFormData {
  registrationNumber: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  gender: 'MALE' | 'FEMALE';
  address?: string;
  phone?: string;
  email?: string;
  classId?: string;
  parentId?: string;
}

export interface ParentFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  occupation?: string;
  address?: string;
  studentRegistrationNumber: string;
}

export interface ClassFormData {
  name: string;
  grade: string;
  section?: string;
  teacherId?: string;
  maxStudents: number;
}

export interface AttendanceFormData {
  studentId: string;
  classId: string;
  date: Date;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
}

export interface PerformanceFormData {
  studentId: string;
  classId: string;
  subject: string;
  assessmentType: 'QUIZ' | 'TEST' | 'ASSIGNMENT' | 'PROJECT' | 'EXAM';
  score: number;
  maxScore: number;
  remarks?: string;
  assessmentDate: Date;
}

// Dashboard Types
export interface DashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalClasses: number;
  pendingApprovals: number;
  todayAttendance: number;
  averagePerformance: number;
  recentActivity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  user: string;
  timestamp: Date;
}

// Filter and Search Types
export interface FilterOptions {
  search?: string;
  status?: string;
  dateFrom?: Date;
  dateTo?: Date;
  classId?: string;
  teacherId?: string;
  parentId?: string;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

// Theme Types
export type Theme = 'light' | 'dark' | 'system';

export interface ThemeConfig {
  theme: Theme;
  systemTheme: 'light' | 'dark';
}

// Context Types
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: any) => Promise<void>;
}

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}