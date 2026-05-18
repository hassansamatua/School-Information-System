import { NextRequest, NextResponse } from 'next/server'
import { executeQuery, testConnection } from '@/lib/mysql'
import { ApiErrorHandler } from '@/lib/api-error-handler'

// GET all students
export async function GET() {
  try {
    const isConnected = await testConnection()
    
    if (!isConnected) {
      // Return mock data when database is not available
      const mockStudents = [
        {
          id: '1',
          registrationNumber: 'REG2024001',
          firstName: 'Alice',
          lastName: 'Johnson',
          email: 'alice.johnson@email.com',
          phone: '+1234567890',
          dateOfBirth: '2010-05-15',
          gender: 'FEMALE',
          address: '123 Main St, City',
          isActive: true,
          classId: '1',
          className: 'Form 1A',
          parentName: 'Mary Johnson',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          registrationNumber: 'REG2024002',
          firstName: 'Bob',
          lastName: 'Smith',
          email: 'bob.smith@email.com',
          phone: '+1234567891',
          dateOfBirth: '2009-08-20',
          gender: 'MALE',
          address: '456 Oak Ave, City',
          isActive: true,
          classId: '2',
          className: 'Form 2B',
          parentName: 'John Smith',
          createdAt: new Date().toISOString(),
        },
      ]
      
      return ApiErrorHandler.handleSuccess(mockStudents, 'Database unavailable, using mock data')
    }
    
    // Get students with class and parent information
    const students = await executeQuery(`
      SELECT 
        s.id,
        s.registrationNumber,
        s.firstName,
        s.lastName,
        s.email,
        s.phone,
        s.dateOfBirth,
        s.gender,
        s.address,
        s.isActive,
        s.classId,
        s.parentId,
        s.createdAt,
        c.name as className,
        c.form,
        c.stream,
        CONCAT(p.firstName, ' ', p.lastName) as parentName
      FROM students s
      LEFT JOIN classes c ON s.classId = c.id
      LEFT JOIN parents p ON s.parentId = p.id
      ORDER BY s.lastName ASC, s.firstName ASC
    `)

    // Transform the data to match the frontend interface
    const transformedStudents = students.map((student: any) => ({
      id: student.id,
      registrationNumber: student.registrationNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email,
      phone: student.phone,
      dateOfBirth: student.dateOfBirth ? student.dateOfBirth.toISOString().split('T')[0] : null,
      gender: student.gender,
      address: student.address,
      isActive: student.isActive,
      classId: student.classId,
      className: student.className,
      parentId: student.parentId,
      parentName: student.parentName,
      createdAt: student.createdAt,
    }))

    return NextResponse.json(transformedStudents)
  } catch (error) {
    return ApiErrorHandler.handleApiError(error, 'fetching students')
  }
}

// POST create new student
export async function POST(request: NextRequest) {
  try {
    const isConnected = await testConnection()
    
    if (!isConnected) {
      return ApiErrorHandler.handleValidationError('Database unavailable - Cannot create student when database is not connected', 'creating student')
    }
    
    const body = await request.json()
    const { 
      registrationNumber, 
      firstName, 
      lastName, 
      email, 
      phone, 
      dateOfBirth, 
      gender, 
      address, 
      classId,
      parentId 
    } = body

    // Validate required fields
    if (!registrationNumber || !firstName || !lastName || !dateOfBirth || !gender) {
      return ApiErrorHandler.handleValidationError('Please fill in all required fields', 'creating student')
    }

    // Check if registration number already exists
    const existingStudent = await executeQuery(
      'SELECT id FROM students WHERE registrationNumber = ?',
      [registrationNumber]
    )

    if (existingStudent.length > 0) {
      return ApiErrorHandler.handleValidationError('Registration number already exists', 'creating student')
    }

    // Generate student ID
    const studentId = require('uuid').v4()

    // Create new student
    await executeQuery(
      'INSERT INTO students (id, registrationNumber, firstName, lastName, email, phone, dateOfBirth, gender, address, classId, parentId, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [studentId, registrationNumber, firstName, lastName, email || null, phone || null, dateOfBirth, gender, address || null, classId || null, parentId || null, true]
    )

    // Get the created student with class and parent information
    const newStudent = await executeQuery(`
      SELECT 
        s.id,
        s.registrationNumber,
        s.firstName,
        s.lastName,
        s.email,
        s.phone,
        s.dateOfBirth,
        s.gender,
        s.address,
        s.isActive,
        s.classId,
        s.parentId,
        s.createdAt,
        c.name as className,
        c.form,
        c.stream,
        CONCAT(p.firstName, ' ', p.lastName) as parentName
      FROM students s
      LEFT JOIN classes c ON s.classId = c.id
      LEFT JOIN parents p ON s.parentId = p.id
      WHERE s.id = ?
    `, [studentId])

    if (newStudent.length === 0) {
      return ApiErrorHandler.handleApiError(new Error('Failed to retrieve created student'), 'creating student')
    }

    // Transform the response
    const transformedStudent = {
      id: newStudent[0].id,
      registrationNumber: newStudent[0].registrationNumber,
      firstName: newStudent[0].firstName,
      lastName: newStudent[0].lastName,
      email: newStudent[0].email,
      phone: newStudent[0].phone,
      dateOfBirth: newStudent[0].dateOfBirth ? newStudent[0].dateOfBirth.toISOString().split('T')[0] : null,
      gender: newStudent[0].gender,
      address: newStudent[0].address,
      isActive: newStudent[0].isActive,
      classId: newStudent[0].classId,
      className: newStudent[0].className,
      parentName: newStudent[0].parentName,
      createdAt: newStudent[0].createdAt,
    }

    return ApiErrorHandler.handleCreated(transformedStudent, 'Student created successfully')
  } catch (error) {
    return ApiErrorHandler.handleApiError(error, 'creating student')
  }
}