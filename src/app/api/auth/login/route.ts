import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/nextauth'
import { getServerSession } from 'next-auth'
import { getUserByEmail } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const user = await getUserByEmail(email)

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check if parent is approved
    if (user.role === 'PARENT' && user.parent && !user.parent.isApproved) {
      return NextResponse.json(
        { error: 'Your account is pending approval' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: `${user.admin?.firstName || user.teacher?.firstName || user.parent?.firstName} ${user.admin?.lastName || user.teacher?.lastName || user.parent?.lastName}`,
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const user = await getUserByEmail(session.user?.email || '')

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: `${user.admin?.firstName || user.teacher?.firstName || user.parent?.firstName} ${user.admin?.lastName || user.teacher?.lastName || user.parent?.lastName}`,
        profile: user.admin || user.teacher || user.parent,
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}