import { NextRequest, NextResponse } from 'next/server'
import { executeQuery, testConnection } from '@/lib/mysql'
import { ApiErrorHandler } from '@/lib/api-error-handler'

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

    // Create user first
    const userId = await executeQuery<{ insertId: number }>(
      `INSERT INTO users (email, password, role) VALUES (?, ?, 'TEACHER')`,
      [email, password]
    ).then(result => (result as any).insertId.toString())

    // Then create teacher
    const teacherId = await executeQuery<{ insertId: number }>(
      `INSERT INTO teachers (userId, firstName, lastName, phone, employeeId, department, isActive) VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [userId, firstName, lastName, phone || null, employeeId, department || null]
    ).then(result => (result as any).insertId.toString())

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