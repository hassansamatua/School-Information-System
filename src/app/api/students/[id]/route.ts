import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

interface StudentRow {
  id: string
  registrationNumber: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  dateOfBirth: string
  gender: string
  address: string | null
  isActive: number
  classId: string | null
  parentId: string | null
  createdAt: string
  class_name: string | null
  class_form: string | null
  class_stream: string | null
  parent_firstName: string | null
  parent_lastName: string | null
  parent_phone: string | null
  parent_user_email: string | null
}

interface AttendanceRow {
  id: string
  date: string
  status: string
  remarks: string | null
}

interface PerformanceRow {
  id: string
  subject: string
  assessmentType: string
  score: number
  maxScore: number
  grade: string
  assessmentDate: string
}

interface ResultRow {
  id: string
  examType: string
  term: string
  academicYear: string
  totalMarks: number
  maxTotalMarks: number
  percentage: number
  grade: string
  rank: number | null
  publishedAt: string
}

// GET single student
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params

    const rows = await executeQuery<StudentRow>(
      `SELECT s.*,
         c.name AS class_name, c.form AS class_form, c.stream AS class_stream,
         p.firstName AS parent_firstName, p.lastName AS parent_lastName, p.phone AS parent_phone,
         pu.email AS parent_user_email
      FROM students s
      LEFT JOIN classes c ON c.id = s.classId
      LEFT JOIN parents p ON p.id = s.parentId
      LEFT JOIN users pu ON pu.id = p.userId
      WHERE s.id = ? LIMIT 1`,
      [id]
    )

    if (!rows[0]) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    }

    const s = rows[0]

    const [attendance, performance, results] = await Promise.all([
      executeQuery<AttendanceRow>(
        'SELECT id, date, status, remarks FROM attendance WHERE studentId = ? ORDER BY date DESC LIMIT 10',
        [id]
      ),
      executeQuery<PerformanceRow>(
        'SELECT id, subject, assessmentType, score, maxScore, grade, assessmentDate FROM performance WHERE studentId = ? ORDER BY assessmentDate DESC LIMIT 10',
        [id]
      ),
      executeQuery<ResultRow>(
        'SELECT id, examType, term, academicYear, totalMarks, maxTotalMarks, percentage, grade, rank, publishedAt FROM results WHERE studentId = ? ORDER BY publishedAt DESC LIMIT 5',
        [id]
      ),
    ])

    return NextResponse.json({
      id: s.id,
      registrationNumber: s.registrationNumber,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      phone: s.phone,
      dateOfBirth: s.dateOfBirth,
      gender: s.gender,
      address: s.address,
      isActive: Boolean(s.isActive),
      classId: s.classId,
      class: s.classId ? {
        id: s.classId,
        name: s.class_name,
        form: s.class_form,
        stream: s.class_stream,
      } : null,
      parentId: s.parentId,
      parent: s.parentId ? {
        id: s.parentId,
        firstName: s.parent_firstName,
        lastName: s.parent_lastName,
        phone: s.parent_phone,
        user: { email: s.parent_user_email },
      } : null,
      attendance,
      performance,
      results,
      createdAt: s.createdAt,
    })
  } catch (error) {
    console.error('Error fetching student:', error)
    return NextResponse.json({ error: 'Failed to fetch student' }, { status: 500 })
  }
}

// PUT update student
export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const { firstName, lastName, email, phone, dateOfBirth, gender, address, classId, parentId, isActive } = body || {}

    if (!firstName || !lastName || !dateOfBirth || !gender) {
      return NextResponse.json({ error: 'First name, last name, date of birth, and gender are required' }, { status: 400 })
    }

    await executeQuery(
      `UPDATE students SET firstName = ?, lastName = ?, email = ?, phone = ?, dateOfBirth = ?, gender = ?, address = ?, classId = ?, parentId = ?, isActive = ?
       WHERE id = ?`,
      [firstName, lastName, email || null, phone || null, dateOfBirth, gender, address || null, classId || null, parentId || null, isActive !== undefined ? (isActive ? 1 : 0) : 1, id]
    )

    const rows = await executeQuery<StudentRow>(
      `SELECT s.*, c.name AS class_name, c.form AS class_form, c.stream AS class_stream,
         p.firstName AS parent_firstName, p.lastName AS parent_lastName
      FROM students s
      LEFT JOIN classes c ON c.id = s.classId
      LEFT JOIN parents p ON p.id = s.parentId
      WHERE s.id = ? LIMIT 1`,
      [id]
    )

    const s = rows[0]
    return NextResponse.json({
      id: s.id,
      registrationNumber: s.registrationNumber,
      firstName: s.firstName,
      lastName: s.lastName,
      email: s.email,
      phone: s.phone,
      dateOfBirth: s.dateOfBirth,
      gender: s.gender,
      address: s.address,
      isActive: Boolean(s.isActive),
      classId: s.classId,
      className: s.class_name,
      parentName: s.parent_firstName && s.parent_lastName ? `${s.parent_firstName} ${s.parent_lastName}` : null,
      createdAt: s.createdAt,
    })
  } catch (error) {
    console.error('Error updating student:', error)
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 })
  }
}

// DELETE student
export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params
    await executeQuery('DELETE FROM students WHERE id = ?', [id])
    return NextResponse.json({ message: 'Student deleted successfully' })
  } catch (error) {
    console.error('Error deleting student:', error)
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 })
  }
}