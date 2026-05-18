import { z } from 'zod'

// Auth Validations
export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  firstName: z.string().min(1, 'Please enter your first name').max(50, 'First name is too long'),
  lastName: z.string().min(1, 'Please enter your last name').max(50, 'Last name is too long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password should be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  phone: z.string().optional(),
  children: z.array(z.object({
    registrationNumber: z.string().min(1, 'Registration number is required'),
    dateOfBirth: z.string().min(1, 'Date of birth is required'),
  })).min(1, 'Please provide at least one child'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters long'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Teacher Validations
export const teacherSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  phone: z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, 'Please enter a valid phone number').optional(),
  employeeId: z.string().min(1, 'Employee ID is required').max(20, 'Employee ID must be less than 20 characters'),
  department: z.string().max(100, 'Department must be less than 100 characters').optional(),
})

export const updateTeacherSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, 'Please enter a valid phone number').optional(),
  department: z.string().max(100, 'Department must be less than 100 characters').optional(),
  isActive: z.boolean(),
})

// Student Validations
export const studentSchema = z.object({
  registrationNumber: z.string().min(1, 'Registration number is required').max(20, 'Registration number must be less than 20 characters'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  dateOfBirth: z.string().refine((date) => {
    const parsedDate = new Date(date)
    const now = new Date()
    const age = now.getFullYear() - parsedDate.getFullYear()
    return age >= 5 && age <= 25
  }, 'Student age must be between 5 and 25 years'),
  gender: z.enum(['MALE', 'FEMALE']),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  phone: z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, 'Please enter a valid phone number').optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  classId: z.string().uuid('Please select a valid class').optional(),
  parentId: z.string().uuid('Please select a valid parent').optional(),
})

export const updateStudentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  dateOfBirth: z.string().refine((date) => {
    const parsedDate = new Date(date)
    const now = new Date()
    const age = now.getFullYear() - parsedDate.getFullYear()
    return age >= 5 && age <= 25
  }, 'Student age must be between 5 and 25 years'),
  gender: z.enum(['MALE', 'FEMALE']),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  phone: z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, 'Please enter a valid phone number').optional(),
  email: z.string().email('Please enter a valid email address').optional(),
  classId: z.string().uuid('Please select a valid class').optional(),
  parentId: z.string().uuid('Please select a valid parent').optional(),
  isActive: z.boolean(),
})

// Parent Validations
export const parentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  phone: z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, 'Please enter a valid phone number').optional(),
  occupation: z.string().max(100, 'Occupation must be less than 100 characters').optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  studentRegistrationNumber: z.string().min(1, 'Student registration number is required'),
})

export const updateParentSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, 'Please enter a valid phone number').optional(),
  occupation: z.string().max(100, 'Occupation must be less than 100 characters').optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
  isApproved: z.boolean(),
})

// Class Validations
export const classSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(50, 'Class name must be less than 50 characters'),
  form: z.number().min(1, 'Form is required').max(4, 'Form must be between 1 and 4'),
  section: z.string().max(10, 'Section must be less than 10 characters').optional(),
  teacherId: z.string().uuid('Please select a valid teacher').optional(),
  maxStudents: z.number().min(1, 'Maximum students must be at least 1').max(100, 'Maximum students cannot exceed 100'),
})

export const updateClassSchema = z.object({
  name: z.string().min(1, 'Class name is required').max(50, 'Class name must be less than 50 characters'),
  form: z.number().min(1, 'Form is required').max(4, 'Form must be between 1 and 4'),
  section: z.string().max(10, 'Section must be less than 10 characters').optional(),
  teacherId: z.string().uuid('Please select a valid teacher').optional(),
  maxStudents: z.number().min(1, 'Maximum students must be at least 1').max(100, 'Maximum students cannot exceed 100'),
  isActive: z.boolean(),
})

// Attendance Validations
export const attendanceSchema = z.object({
  studentId: z.string().uuid('Please select a valid student'),
  classId: z.string().uuid('Please select a valid class'),
  date: z.string().min(1, 'Date is required'),
  status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
  remarks: z.string().max(200, 'Remarks must be less than 200 characters').optional(),
})

export const bulkAttendanceSchema = z.object({
  classId: z.string().uuid('Please select a valid class'),
  date: z.string().min(1, 'Date is required'),
  attendance: z.array(z.object({
    studentId: z.string().uuid('Please select a valid student'),
    status: z.enum(['PRESENT', 'ABSENT', 'LATE', 'EXCUSED']),
    remarks: z.string().max(200, 'Remarks must be less than 200 characters').optional(),
  })).min(1, 'At least one student attendance is required'),
})

// Performance Validations
export const performanceSchema = z.object({
  studentId: z.string().uuid('Please select a valid student'),
  classId: z.string().uuid('Please select a valid class'),
  subject: z.string().min(1, 'Subject is required').max(50, 'Subject must be less than 50 characters'),
  assessmentType: z.enum(['QUIZ', 'TEST', 'ASSIGNMENT', 'PROJECT', 'EXAM']),
  score: z.number().min(0, 'Score must be at least 0'),
  maxScore: z.number().min(1, 'Maximum score must be at least 1'),
  remarks: z.string().max(200, 'Remarks must be less than 200 characters').optional(),
  assessmentDate: z.string().min(1, 'Assessment date is required'),
}).refine((data) => data.score <= data.maxScore, {
  message: 'Score cannot be greater than maximum score',
  path: ['score'],
})

// Result Validations
export const resultSchema = z.object({
  studentId: z.string().uuid('Please select a valid student'),
  classId: z.string().uuid('Please select a valid class'),
  examType: z.enum(['MIDTERM', 'FINAL', 'UNIT_TEST', 'PRACTICAL']),
  term: z.string().min(1, 'Term is required').max(20, 'Term must be less than 20 characters'),
  academicYear: z.string().min(1, 'Academic year is required').max(20, 'Academic year must be less than 20 characters'),
  subjects: z.array(z.object({
    subject: z.string().min(1, 'Subject is required').max(50, 'Subject must be less than 50 characters'),
    marks: z.number().min(0, 'Marks must be at least 0'),
    maxMarks: z.number().min(1, 'Maximum marks must be at least 1'),
    form: z.number().min(1, 'Form must be between 1 and 4').max(4, 'Form must be between 1 and 4').optional(),
  stream: z.string().max(1, 'Stream must be a single letter').optional(),
    remarks: z.string().max(200, 'Remarks must be less than 200 characters').optional(),
  })).min(1, 'At least one subject is required'),
  remarks: z.string().max(500, 'Remarks must be less than 500 characters').optional(),
}).refine((data) => {
  return data.subjects.every(subject => subject.marks <= subject.maxMarks)
}, {
  message: 'Subject marks cannot be greater than maximum marks',
  path: ['subjects'],
})

// Announcement Validations
export const announcementSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  content: z.string().min(1, 'Content is required').max(2000, 'Content must be less than 2000 characters'),
  type: z.enum(['GENERAL', 'URGENT', 'ACADEMIC', 'EVENT']),
  targetAudience: z.enum(['ALL', 'TEACHERS', 'PARENTS', 'SPECIFIC_CLASS', 'SPECIFIC_STUDENT']),
  targetId: z.string().uuid('Please select a valid target').optional(),
  expiresAt: z.string().optional(),
})

// Event Validations
export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  type: z.enum(['ACADEMIC', 'SPORTS', 'CULTURAL', 'MEETING', 'HOLIDAY']).refine((val) => val !== undefined, { message: 'Event type is required' }),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  location: z.string().max(200, 'Location must be less than 200 characters').optional(),
  targetAudience: z.enum(['ALL', 'TEACHERS', 'PARENTS', 'SPECIFIC_CLASS', 'SPECIFIC_STUDENT']),
  targetId: z.string().uuid('Please select a valid target').optional(),
}).refine((data) => new Date(data.endDate) >= new Date(data.startDate), {
  message: 'End date must be after start date',
  path: ['endDate'],
})

// Approval Validations
export const approvalSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']).refine((val) => val !== undefined, { message: 'Approval status is required' }),
  comments: z.string().max(500, 'Comments must be less than 500 characters').optional(),
})

// Report Validations
export const reportSchema = z.object({
  type: z.enum(['ATTENDANCE', 'PERFORMANCE', 'RESULTS', 'STUDENT_LIST', 'TEACHER_ACTIVITY', 'PARENT_LIST']).refine((val) => val !== undefined, { message: 'Report type is required' }),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  classId: z.string().uuid('Please select a valid class').optional(),
  studentId: z.string().uuid('Please select a valid student').optional(),
  teacherId: z.string().uuid('Please select a valid teacher').optional(),
}).refine((data) => {
  if (data.dateFrom && data.dateTo) {
    return new Date(data.dateTo) >= new Date(data.dateFrom)
  }
  return true
}, {
  message: 'End date must be after start date',
  path: ['dateTo'],
})

// Profile Validations
export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  phone: z.string().regex(/^[+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/, 'Please enter a valid phone number').optional(),
  address: z.string().max(200, 'Address must be less than 200 characters').optional(),
})

// Search and Filter Validations
export const searchSchema = z.object({
  query: z.string().max(100, 'Search query must be less than 100 characters').optional(),
  page: z.number().min(1, 'Page must be at least 1').default(1),
  limit: z.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(10),
  sortBy: z.string().max(50, 'Sort field must be less than 50 characters').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// File Upload Validations
export const fileUploadSchema = z.object({
  file: z.any().refine((file) => file?.size <= 5 * 1024 * 1024, 'File size must be less than 5MB')
    .refine((file) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-word', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      return allowedTypes.includes(file?.type)
    }, 'Only images, PDF, and Office documents are allowed'),
})

// Notification Validations
export const notificationSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  message: z.string().min(1, 'Message is required').max(500, 'Message must be less than 500 characters'),
  type: z.enum(['INFO', 'SUCCESS', 'WARNING', 'ERROR']).refine((val) => val !== undefined, { message: 'Notification type is required' }),
  userIds: z.array(z.string().uuid()).optional(),
  targetAudience: z.enum(['ALL', 'TEACHERS', 'PARENTS', 'SPECIFIC_CLASS', 'SPECIFIC_STUDENT']).optional(),
  targetId: z.string().uuid().optional(),
  actionUrl: z.string().url('Please enter a valid URL').optional(),
  actionText: z.string().max(50, 'Action text must be less than 50 characters').optional(),
})

// Export types for use in components
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
export type TeacherFormData = z.infer<typeof teacherSchema>
export type UpdateTeacherFormData = z.infer<typeof updateTeacherSchema>
export type StudentFormData = z.infer<typeof studentSchema>
export type UpdateStudentFormData = z.infer<typeof updateStudentSchema>
export type ParentFormData = z.infer<typeof parentSchema>
export type UpdateParentFormData = z.infer<typeof updateParentSchema>
export type ClassFormData = z.infer<typeof classSchema>
export type UpdateClassFormData = z.infer<typeof updateClassSchema>
export type AttendanceFormData = z.infer<typeof attendanceSchema>
export type BulkAttendanceFormData = z.infer<typeof bulkAttendanceSchema>
export type PerformanceFormData = z.infer<typeof performanceSchema>
export type ResultFormData = z.infer<typeof resultSchema>
export type AnnouncementFormData = z.infer<typeof announcementSchema>
export type EventFormData = z.infer<typeof eventSchema>
export type ApprovalFormData = z.infer<typeof approvalSchema>
export type ReportFormData = z.infer<typeof reportSchema>
export type ProfileFormData = z.infer<typeof profileSchema>
export type SearchFormData = z.infer<typeof searchSchema>
export type FileUploadFormData = z.infer<typeof fileUploadSchema>
export type NotificationFormData = z.infer<typeof notificationSchema>