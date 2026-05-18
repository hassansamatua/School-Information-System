import { NextRequest, NextResponse } from 'next/server'
import { executeQuery, testConnection } from '@/lib/mysql'
import { ApiErrorHandler } from '@/lib/api-error-handler'

// GET all classes
export async function GET() {
  try {
    // Try to connect to database
    const isConnected = await testConnection()
    
    if (!isConnected) {
      // Return mock data when database is not available
      const mockClasses = [
        {
          id: '1',
          name: 'Form 1A',
          form: 1,
          stream: 'A',
          maxStudents: 40,
          currentStudents: 0,
          isActive: true,
          teacherId: null,
          teacherName: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Form 1B',
          form: 1,
          stream: 'B',
          maxStudents: 40,
          currentStudents: 0,
          isActive: true,
          teacherId: null,
          teacherName: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Form 2A',
          form: 2,
          stream: 'A',
          maxStudents: 40,
          currentStudents: 0,
          isActive: true,
          teacherId: null,
          teacherName: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          name: 'Form 2B',
          form: 2,
          stream: 'B',
          maxStudents: 40,
          currentStudents: 0,
          isActive: true,
          teacherId: null,
          teacherName: null,
          createdAt: new Date().toISOString(),
        },
      ]
      
      return ApiErrorHandler.handleSuccess(mockClasses, 'Database unavailable, using mock data')
    }
    
    // Get classes with teacher information and student count
    const classes = await executeQuery(`
      SELECT 
        c.id,
        c.name,
        c.form,
        c.stream,
        c.maxStudents,
        c.currentStudents,
        c.isActive,
        c.teacherId,
        c.createdAt,
        CONCAT(t.firstName, ' ', t.lastName) as teacherName,
        u.email as teacherEmail,
        (SELECT COUNT(*) FROM students s WHERE s.classId = c.id) as studentCount
      FROM classes c
      LEFT JOIN teachers t ON c.teacherId = t.id
      LEFT JOIN users u ON t.userId = u.id
      ORDER BY c.form ASC, c.stream ASC
    `)

    // Transform the data to match the frontend interface
    const transformedClasses = classes.map((cls: any) => ({
      id: cls.id,
      name: cls.name,
      form: cls.form,
      stream: cls.stream,
      maxStudents: cls.maxStudents,
      currentStudents: Number(cls.studentCount || 0),
      isActive: cls.isActive,
      teacherId: cls.teacherId,
      teacherName: cls.teacherName,
      createdAt: cls.createdAt,
    }))

    return NextResponse.json(transformedClasses)
  } catch (error) {
    return ApiErrorHandler.handleApiError(error, 'fetching classes')
  }
}

// POST create new class
export async function POST(request: NextRequest) {
  try {
    const isConnected = await testConnection()
    
    if (!isConnected) {
      return NextResponse.json(
        { error: 'Database unavailable - Cannot create class when database is not connected' },
        { status: 503 }
      )
    }
    
    const body = await request.json()
    const { name, form, stream, maxStudents, teacherId } = body

    // Validate required fields
    if (!form || !stream || !maxStudents) {
      return ApiErrorHandler.handleValidationError('Form, stream, and max students are required', 'creating class')
    }

    // Check if class with same form and stream already exists
    const existingClass = await executeQuery(
      'SELECT id FROM classes WHERE form = ? AND stream = ?',
      [form, stream]
    )

    if (existingClass.length > 0) {
      return ApiErrorHandler.handleValidationError(`Form ${form}${stream} already exists`, 'creating class')
    }

    // Generate class name if not provided
    const className = name || `Form ${form}${stream}`
    const classId = require('uuid').v4()

    // Create new class
    await executeQuery(
      'INSERT INTO classes (id, name, form, stream, maxStudents, currentStudents, isActive, teacherId) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [classId, className, form, stream, maxStudents, 0, true, teacherId || null]
    )

    // Get the created class with teacher information
    const newClass = await executeQuery(`
      SELECT 
        c.id,
        c.name,
        c.form,
        c.stream,
        c.maxStudents,
        c.currentStudents,
        c.isActive,
        c.teacherId,
        c.createdAt,
        CONCAT(t.firstName, ' ', t.lastName) as teacherName,
        u.email as teacherEmail
      FROM classes c
      LEFT JOIN teachers t ON c.teacherId = t.id
      LEFT JOIN users u ON t.userId = u.id
      WHERE c.id = ?
    `, [classId])

    if (newClass.length === 0) {
      return ApiErrorHandler.handleApiError(new Error('Failed to retrieve created class'), 'creating class')
    }

    // Transform the response
    const transformedClass = {
      id: newClass[0].id,
      name: newClass[0].name,
      form: newClass[0].form,
      stream: newClass[0].stream,
      maxStudents: newClass[0].maxStudents,
      currentStudents: newClass[0].currentStudents,
      isActive: newClass[0].isActive,
      teacherId: newClass[0].teacherId,
      teacherName: newClass[0].teacherName,
      createdAt: newClass[0].createdAt,
    }

    return ApiErrorHandler.handleCreated(transformedClass, 'Class created successfully')
  } catch (error) {
    return ApiErrorHandler.handleApiError(error, 'creating class')
  }
}