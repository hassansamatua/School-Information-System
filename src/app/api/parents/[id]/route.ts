import { NextRequest, NextResponse } from 'next/server'
import { executeQuery, executeTransaction } from '@/lib/mysql'

interface ParentRow {
  id: string
  userId: string
  firstName: string
  lastName: string
  phone: string | null
  occupation: string | null
  address: string | null
  isApproved: number
  createdAt: string
  user_email: string | null
  user_isActive: number | null
}

interface StudentRow {
  id: string
  firstName: string
  lastName: string
  registrationNumber: string
  classId: string | null
  class_name: string | null
  class_form: string | null
  class_stream: string | null
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

// GET single parent
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params

    const parentRows = await executeQuery<ParentRow>(
      `SELECT p.*, u.email AS user_email, u.isActive AS user_isActive
       FROM parents p
       LEFT JOIN users u ON u.id = p.userId
       WHERE p.id = ? LIMIT 1`,
      [id]
    )

    if (!parentRows[0]) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 })
    }

    const p = parentRows[0]

    const students = await executeQuery<StudentRow>(
      `SELECT s.id, s.firstName, s.lastName, s.registrationNumber, s.classId,
         c.name AS class_name, c.form AS class_form, c.stream AS class_stream
       FROM students s
       LEFT JOIN classes c ON c.id = s.classId
       WHERE s.parentId = ?`,
      [id]
    )

    const studentsWithDetails = await Promise.all(
      students.map(async (s) => {
        const [attendance, performance, results] = await Promise.all([
          executeQuery<AttendanceRow>(
            'SELECT id, date, status, remarks FROM attendance WHERE studentId = ? ORDER BY date DESC LIMIT 10',
            [s.id]
          ),
          executeQuery<PerformanceRow>(
            'SELECT id, subject, assessmentType, score, maxScore, grade, assessmentDate FROM performance WHERE studentId = ? ORDER BY assessmentDate DESC LIMIT 10',
            [s.id]
          ),
          executeQuery<ResultRow>(
            'SELECT id, examType, term, academicYear, totalMarks, maxTotalMarks, percentage, grade, rank, publishedAt FROM results WHERE studentId = ? ORDER BY publishedAt DESC LIMIT 5',
            [s.id]
          ),
        ])

        return {
          ...s,
          class: s.classId ? {
            id: s.classId,
            name: s.class_name,
            form: s.class_form,
            stream: s.class_stream,
          } : null,
          attendance,
          performance,
          results,
        }
      })
    )

    const studentCountRows = await executeQuery<{ count: number }>(
      'SELECT COUNT(*) AS count FROM students WHERE parentId = ?',
      [id]
    )

    return NextResponse.json({
      id: p.id,
      firstName: p.firstName,
      lastName: p.lastName,
      email: p.user_email,
      phone: p.phone,
      occupation: p.occupation,
      address: p.address,
      isApproved: Boolean(p.isApproved),
      isActive: p.user_isActive === 1,
      studentCount: studentCountRows[0]?.count ?? 0,
      students: studentsWithDetails,
      createdAt: p.createdAt,
    })
  } catch (error) {
    console.error('Error fetching parent:', error)
    return NextResponse.json({ error: 'Failed to fetch parent' }, { status: 500 })
  }
}

// PUT update parent
export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params
    const body = await request.json()
    const { firstName, lastName, phone, occupation, address, isApproved, isActive } = body || {}

    const parentRows = await executeQuery<ParentRow>(
      `SELECT p.*, u.email AS user_email, u.isActive AS user_isActive, p.userId
       FROM parents p
       LEFT JOIN users u ON u.id = p.userId
       WHERE p.id = ? LIMIT 1`,
      [id]
    )

    if (!parentRows[0]) {
      return NextResponse.json({ error: 'Parent not found' }, { status: 404 })
    }

    const p = parentRows[0]

    // Build update query dynamically based on provided fields
    const updates: string[] = []
    const params: any[] = []

    if (firstName !== undefined) {
      updates.push('firstName = ?')
      params.push(firstName)
    }
    if (lastName !== undefined) {
      updates.push('lastName = ?')
      params.push(lastName)
    }
    if (phone !== undefined) {
      updates.push('phone = ?')
      params.push(phone)
    }
    if (occupation !== undefined) {
      updates.push('occupation = ?')
      params.push(occupation)
    }
    if (address !== undefined) {
      updates.push('address = ?')
      params.push(address)
    }
    if (isApproved !== undefined) {
      updates.push('isApproved = ?')
      params.push(isApproved ? 1 : 0)
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 })
    }

    params.push(id)

    const userUpdates: any[] = []
    const userParams: any[] = []
    if (isActive !== undefined) {
      userUpdates.push('UPDATE users SET isActive = ? WHERE id = ?')
      userParams.push(isActive ? 1 : 0, p.userId)
    }

    await executeTransaction([
      {
        query: `UPDATE parents SET ${updates.join(', ')} WHERE id = ?`,
        params,
      },
      ...(userUpdates.length > 0 ? [{
        query: userUpdates[0],
        params: userParams,
      }] : []),
    ])

    const updatedRows = await executeQuery<ParentRow>(
      `SELECT p.*, u.email AS user_email, u.isActive AS user_isActive
       FROM parents p
       LEFT JOIN users u ON u.id = p.userId
       WHERE p.id = ? LIMIT 1`,
      [id]
    )

    const studentCountRows = await executeQuery<{ count: number }>(
      'SELECT COUNT(*) AS count FROM students WHERE parentId = ?',
      [id]
    )

    const updated = updatedRows[0]
    return NextResponse.json({
      id: updated.id,
      firstName: updated.firstName,
      lastName: updated.lastName,
      email: updated.user_email,
      phone: updated.phone,
      occupation: updated.occupation,
      address: updated.address,
      isApproved: Boolean(updated.isApproved),
      isActive: isActive !== undefined ? isActive : updated.user_isActive === 1,
      studentCount: studentCountRows[0]?.count ?? 0,
      createdAt: updated.createdAt,
    })
  } catch (error) {
    console.error('Error updating parent:', error)
    return NextResponse.json({ error: 'Failed to update parent' }, { status: 500 })
  }
}

// DELETE parent
export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params

    const studentCountRows = await executeQuery<{ count: number }>(
      'SELECT COUNT(*) AS count FROM students WHERE parentId = ?',
      [id]
    )

    const studentCount = studentCountRows[0]?.count ?? 0

    if (studentCount > 0) {
      return NextResponse.json({ error: 'Cannot delete parent with enrolled students' }, { status: 400 })
    }

    const parentRows = await executeQuery<{ userId: string }>('SELECT userId FROM parents WHERE id = ? LIMIT 1', [id])
    const userId = parentRows[0]?.userId

    await executeTransaction([
      { query: 'DELETE FROM parents WHERE id = ?', params: [id] },
      { query: 'DELETE FROM users WHERE id = ?', params: [userId] },
    ])

    return NextResponse.json({ message: 'Parent deleted successfully' })
  } catch (error) {
    console.error('Error deleting parent:', error)
    return NextResponse.json({ error: 'Failed to delete parent' }, { status: 500 })
  }
}