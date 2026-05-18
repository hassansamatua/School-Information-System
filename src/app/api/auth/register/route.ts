import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import bcrypt from 'bcryptjs'
import { executeQuery, executeTransaction } from '@/lib/mysql'
import { registerSchema } from '@/lib/validations'
import {
  checkRegistrationLimit,
  recordRegistrationFailure,
  clearRegistrationFailures,
  getClientIdentifier,
} from '@/lib/rate-limit'

function formatRetryAfter(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''}${seconds > 0 ? ` ${seconds}s` : ''}`
  return `${seconds} seconds`
}

export async function POST(request: NextRequest) {
  const clientId = getClientIdentifier(request)

  // Check if currently locked
  const limit = checkRegistrationLimit(clientId)
  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: `Too many failed attempts. Registration is locked. Please try again in ${formatRetryAfter(limit.retryAfterMs)}.`,
        lockedUntil: limit.lockedUntil,
        retryAfterMs: limit.retryAfterMs,
      },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    const { firstName, lastName, email, password, phone, children } = validatedData

    // Check if user already exists
    const existingUsers = await executeQuery<{ id: string }>(
      'SELECT id FROM users WHERE email = ? LIMIT 1',
      [email]
    )
    if (existingUsers.length > 0) {
      const status = recordRegistrationFailure(clientId)
      return NextResponse.json(
        {
          error: 'User with this email already exists',
          remainingAttempts: status.remainingAttempts,
          lockedUntil: status.lockedUntil,
        },
        { status: 400 }
      )
    }

    // Validate every child by registration number AND date of birth
    const verifiedStudents: { id: string; parentId: string | null; registrationNumber: string }[] = []
    for (const child of children) {
      const students = await executeQuery<{
        id: string
        parentId: string | null
        registrationNumber: string
        dateOfBirth: string | Date
      }>(
        'SELECT id, parentId, registrationNumber, dateOfBirth FROM students WHERE registrationNumber = ? LIMIT 1',
        [child.registrationNumber]
      )
      const student = students[0]
      if (!student) {
        const status = recordRegistrationFailure(clientId)
        return NextResponse.json(
          {
            error: `Student with registration number "${child.registrationNumber}" not found`,
            remainingAttempts: status.remainingAttempts,
            lockedUntil: status.lockedUntil,
          },
          { status: status.lockedUntil ? 429 : 404 }
        )
      }

      // Normalize date format for comparison (YYYY-MM-DD)
      const dbDob = student.dateOfBirth instanceof Date
        ? student.dateOfBirth.toISOString().slice(0, 10)
        : String(student.dateOfBirth).slice(0, 10)
      const inputDob = String(child.dateOfBirth).slice(0, 10)

      if (dbDob !== inputDob) {
        const status = recordRegistrationFailure(clientId)
        return NextResponse.json(
          {
            error: `Date of birth does not match for student "${child.registrationNumber}"`,
            remainingAttempts: status.remainingAttempts,
            lockedUntil: status.lockedUntil,
          },
          { status: status.lockedUntil ? 429 : 400 }
        )
      }

      if (student.parentId) {
        const status = recordRegistrationFailure(clientId)
        return NextResponse.json(
          {
            error: `Student "${child.registrationNumber}" already has a parent account`,
            remainingAttempts: status.remainingAttempts,
            lockedUntil: status.lockedUntil,
          },
          { status: status.lockedUntil ? 429 : 400 }
        )
      }

      verifiedStudents.push({
        id: student.id,
        parentId: student.parentId,
        registrationNumber: student.registrationNumber,
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user, parent, and link all students in a transaction
    const userId = uuid()
    const parentId = uuid()

    const queries = [
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
      ...verifiedStudents.map(s => ({
        query: `UPDATE students SET parentId = ? WHERE id = ?`,
        params: [parentId, s.id],
      })),
    ]

    await executeTransaction(queries)

    // Success - clear failed attempts
    clearRegistrationFailures(clientId)

    return NextResponse.json({
      success: true,
      message: `Registration successful. ${verifiedStudents.length} child(ren) linked. Your account is pending approval.`,
      user: {
        id: userId,
        email,
        role: 'PARENT',
        name: `${firstName} ${lastName}`,
      },
      linkedChildren: verifiedStudents.length,
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
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}