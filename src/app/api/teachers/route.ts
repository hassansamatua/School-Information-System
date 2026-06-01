import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { executeQuery, executeTransaction, testConnection } from '@/lib/mysql'
import { ApiErrorHandler } from '@/lib/api-error-handler'
import bcrypt from 'bcryptjs'

// GET all teachers
export async function GET() {
  try {
    const isConnected = await testConnection()

    if (!isConnected) {
      // Return mock data when database is not available
      const mockTeachers = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Smith',
          email: 'john.smith@school.edu',
          employeeId: 'T001',
          department: 'Mathematics',
          isActive: true,
          classCount: 0,
        },
        {
          id: '2',
          firstName: 'Sarah',
          lastName: 'Johnson',
          email: 'sarah.johnson@school.edu',
          employeeId: 'T002',
          department: 'Science',
          isActive: true,
          classCount: 0,
        },
      ]
      
      return ApiErrorHandler.handleSuccess(mockTeachers, 'Database unavailable, using mock data')
    }
    
    const teachers = await executeQuery(`
      SELECT
        t.id,
        t.firstName,
        t.lastName,
        t.employeeId,
        t.department,
        t.isActive,
        u.email,
        (SELECT COUNT(*) FROM classes c WHERE c.teacherId = t.id) as classCount
      FROM teachers t
      LEFT JOIN users u ON t.userId = u.id
      WHERE t.isActive = 1
      ORDER BY t.lastName ASC
    `)

    // Transform the data to match the frontend interface
    const transformedTeachers = (teachers as any[]).map((teacher) => ({
      id: teacher.id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      employeeId: teacher.employeeId,
      department: teacher.department,
      isActive: !!teacher.isActive,
      classCount: Number(teacher.classCount) || 0,
    }))

    return NextResponse.json(transformedTeachers)
  } catch (error) {
    return ApiErrorHandler.handleApiError(error, 'fetching teachers')
  }
}

// POST create teacher
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password, phone, employeeId, department } = body

    if (!firstName || !lastName || !email || !password || !employeeId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check for duplicate email
    const existing = await executeQuery<any[]>(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    )
    if ((existing as any[]).length > 0) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    // Check for duplicate employeeId
    const existingEmployee = await executeQuery<any[]>(
      'SELECT id FROM teachers WHERE employeeId = ? LIMIT 1',
      [employeeId]
    )
    if ((existingEmployee as any[]).length > 0) {
      return NextResponse.json({ error: 'Employee ID already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const userId = uuid()
    const teacherId = uuid()

    await executeTransaction([
      {
        query: 'INSERT INTO users (id, email, password, role, isActive) VALUES (?, ?, ?, \'TEACHER\', 1)',
        params: [userId, email, hashedPassword]
      },
      {
        query: 'INSERT INTO teachers (id, userId, firstName, lastName, phone, employeeId, department, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, 1)',
        params: [teacherId, userId, firstName, lastName, phone || null, employeeId, department || null]
      },
    ])

    return NextResponse.json({
      id: teacherId,
      firstName,
      lastName,
      email,
      phone,
      employeeId,
      department,
      isActive: true,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating teacher:', error)
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 })
  }
}