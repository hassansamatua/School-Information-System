import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import bcrypt from 'bcryptjs'
import { executeQuery, executeTransaction } from '@/lib/mysql'
import { registerSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    const { firstName, lastName, email, password, phone, studentRegistrationNumber } = validatedData

    // Check if user already exists
    const existingUsers = await executeQuery<{ id: string }>(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    )
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Find student by registration number
    const students = await executeQuery<{
      id: string
      parentId: string | null
    }>(
      'SELECT id, parentId FROM students WHERE registrationNumber = ? LIMIT 1',
      [studentRegistrationNumber]
    )
    const student = students[0]

    if (!student) {
      return NextResponse.json(
        { error: 'Student with this registration number not found' },
        { status: 404 }
      )
    }

    // Check if student already has a parent account
    if (student.parentId) {
      return NextResponse.json(
        { error: 'This student already has a parent account' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user and parent in a transaction
    const userId = uuid()
    const parentId = uuid()

    await executeTransaction([
      {
        query: `INSERT INTO users (id, email, password, role, isActive)
                VALUES (?, ?, ?, 'PARENT', 1)`,
        params: [userId, email, hashedPassword],
      },
      {
        query: `INSERT INTO parents (id, userId, firstName, lastName, phone, isApproved)
                VALUES (?, ?, ?, ?, ?, 0)`,
        params: [parentId, userId, firstName, lastName, phone || null],
      },
      {
        query: `UPDATE students SET parentId = ? WHERE id = ?`,
        params: [parentId, student.id],
      },
    ])

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Your account is pending approval.',
      user: {
        id: userId,
        email,
        role: 'PARENT',
        name: `${firstName} ${lastName}`,
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error instanceof Error && error.message.includes('Validation error')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}