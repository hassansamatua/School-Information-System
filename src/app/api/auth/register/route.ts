import { NextRequest, NextResponse } from 'next/server'
import { createUser, getUserByEmail } from '@/lib/auth'
import { prisma } from '@/lib/database'
import { registerSchema } from '@/lib/validations'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    const { firstName, lastName, email, password, phone, studentRegistrationNumber } = validatedData

    // Check if user already exists
    const existingUser = await getUserByEmail(email)
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Find student by registration number
    const student = await prisma.student.findUnique({
      where: { registrationNumber: studentRegistrationNumber },
      include: { parent: true }
    })

    if (!student) {
      return NextResponse.json(
        { error: 'Student with this registration number not found' },
        { status: 404 }
      )
    }

    // Check if student already has a parent account
    if (student.parent) {
      return NextResponse.json(
        { error: 'This student already has a parent account' },
        { status: 400 }
      )
    }

    // Create user and parent in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await createUser(email, password, 'PARENT')

      // Create parent
      const parent = await tx.parent.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          phone,
          isApproved: false, // Requires admin approval
        }
      })

      // Link parent to student
      await tx.student.update({
        where: { id: student.id },
        data: { parentId: parent.id }
      })

      return { user, parent }
    })

    return NextResponse.json({
      success: true,
      message: 'Registration successful. Your account is pending approval.',
      user: {
        id: result.user.id,
        email: result.user.email,
        role: result.user.role,
        name: `${result.parent.firstName} ${result.parent.lastName}`,
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