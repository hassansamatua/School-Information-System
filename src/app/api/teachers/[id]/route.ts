import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

interface TeacherRow {
  id: string
  firstName: string
  lastName: string
  phone: string | null
  employeeId: string | null
  department: string | null
  isActive: number
  createdAt: string
  user_email: string | null
}

interface ClassRow {
  id: string
  name: string
  form: string | null
  stream: string | null
  currentStudents: number
  maxStudents: number
}

// GET single teacher
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params

    const teacherRows = await executeQuery<TeacherRow>(
      `SELECT t.*, u.email AS user_email
       FROM teachers t
       LEFT JOIN users u ON u.id = t.userId
       WHERE t.id = ? LIMIT 1`,
      [id]
    )

    if (!teacherRows[0]) {
      return NextResponse.json({ error: 'Teacher not found' }, { status: 404 })
    }

    const t = teacherRows[0]

    const classes = await executeQuery<ClassRow>(
      `SELECT id, name, form, stream, currentStudents, maxStudents
       FROM classes WHERE teacherId = ?`,
      [id]
    )

    return NextResponse.json({
      id: t.id,
      firstName: t.firstName,
      lastName: t.lastName,
      email: t.user_email,
      employeeId: t.employeeId,
      department: t.department,
      isActive: Boolean(t.isActive),
      classes,
      classCount: classes.length,
      createdAt: t.createdAt,
    })
  } catch (error) {
    console.error('Error fetching teacher:', error)
    return NextResponse.json({ error: 'Failed to fetch teacher' }, { status: 500 })
  }
}

// PUT update teacher
export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const { firstName, lastName, phone, department, isActive } = body || {}

    if (!firstName || !lastName) {
      return NextResponse.json({ error: 'First name and last name are required' }, { status: 400 })
    }

    await executeQuery(
      `UPDATE teachers SET firstName = ?, lastName = ?, phone = ?, department = ?, isActive = ?
       WHERE id = ?`,
      [firstName, lastName, phone || null, department || null, isActive !== undefined ? (isActive ? 1 : 0) : 1, id]
    )

    const teacherRows = await executeQuery<TeacherRow>(
      `SELECT t.*, u.email AS user_email
       FROM teachers t
       LEFT JOIN users u ON u.id = t.userId
       WHERE t.id = ? LIMIT 1`,
      [id]
    )

    const classCountRows = await executeQuery<{ count: number }>(
      'SELECT COUNT(*) AS count FROM classes WHERE teacherId = ?',
      [id]
    )

    const t = teacherRows[0]
    return NextResponse.json({
      id: t.id,
      firstName: t.firstName,
      lastName: t.lastName,
      email: t.user_email,
      employeeId: t.employeeId,
      department: t.department,
      isActive: Boolean(t.isActive),
      classCount: classCountRows[0]?.count ?? 0,
      createdAt: t.createdAt,
    })
  } catch (error) {
    console.error('Error updating teacher:', error)
    return NextResponse.json({ error: 'Failed to update teacher' }, { status: 500 })
  }
}

// DELETE teacher
export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params

    const classCountRows = await executeQuery<{ count: number }>(
      'SELECT COUNT(*) AS count FROM classes WHERE teacherId = ?',
      [id]
    )

    const classCount = classCountRows[0]?.count ?? 0

    if (classCount > 0) {
      return NextResponse.json({ error: 'Cannot delete teacher with assigned classes' }, { status: 400 })
    }

    await executeQuery('DELETE FROM teachers WHERE id = ?', [id])
    return NextResponse.json({ message: 'Teacher deleted successfully' })
  } catch (error) {
    console.error('Error deleting teacher:', error)
    return NextResponse.json({ error: 'Failed to delete teacher' }, { status: 500 })
  }
}