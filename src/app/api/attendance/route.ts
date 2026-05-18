import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { executeQuery } from '@/lib/mysql'

interface Row {
  id: string
  studentId: string
  classId: string
  date: string
  status: string
  remarks: string | null
  recordedBy: string
  createdAt: string
  student_firstName: string | null
  student_lastName: string | null
  student_registrationNumber: string | null
  class_name: string | null
  class_form: string | null
  class_stream: string | null
  user_email: string | null
}

function transform(r: Row) {
  return {
    id: r.id,
    studentId: r.studentId,
    student: {
      id: r.studentId,
      firstName: r.student_firstName,
      lastName: r.student_lastName,
      registrationNumber: r.student_registrationNumber,
    },
    classId: r.classId,
    class: {
      id: r.classId,
      name: r.class_name,
      form: r.class_form,
      stream: r.class_stream,
    },
    date: r.date,
    status: r.status,
    remarks: r.remarks,
    recordedBy: r.recordedBy,
    recordedByUser: r.user_email,
    createdAt: r.createdAt,
  }
}

// GET attendance records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const classId = searchParams.get('classId')
    const date = searchParams.get('date')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: string[] = []
    const params: any[] = []

    if (studentId) { where.push('a.studentId = ?'); params.push(studentId) }
    if (classId) { where.push('a.classId = ?'); params.push(classId) }
    if (date) { where.push('a.date = ?'); params.push(date) }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : ''
    const offset = (page - 1) * limit

    const [rows, countRows] = await Promise.all([
      executeQuery<Row>(
        `SELECT a.*,
           s.firstName AS student_firstName, s.lastName AS student_lastName, s.registrationNumber AS student_registrationNumber,
           c.name AS class_name, c.form AS class_form, c.stream AS class_stream,
           u.email AS user_email
        FROM attendance a
        LEFT JOIN students s ON s.id = a.studentId
        LEFT JOIN classes c ON c.id = a.classId
        LEFT JOIN users u ON u.id = a.recordedBy
        ${whereClause}
        ORDER BY a.date DESC
        LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      ),
      executeQuery<{ total: number }>(
        `SELECT COUNT(*) AS total FROM attendance a ${whereClause}`,
        params
      ),
    ])

    const total = countRows[0]?.total ?? 0

    return NextResponse.json({
      data: rows.map(transform),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Error fetching attendance:', error)
    return NextResponse.json({ error: 'Failed to fetch attendance' }, { status: 500 })
  }
}

// POST create attendance record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, classId, date, status, remarks, recordedBy } = body || {}

    if (!studentId || !classId || !date || !status || !recordedBy) {
      return NextResponse.json(
        { error: 'Student ID, class ID, date, status, and recorded by are required' },
        { status: 400 }
      )
    }

    const existing = await executeQuery<Row>(
      'SELECT id FROM attendance WHERE studentId = ? AND classId = ? AND date = ? LIMIT 1',
      [studentId, classId, date]
    )
    if (existing[0]) {
      return NextResponse.json(
        { error: 'Attendance record already exists for this student on this date' },
        { status: 400 }
      )
    }

    const id = uuid()
    await executeQuery(
      `INSERT INTO attendance (id, studentId, classId, date, status, remarks, recordedBy)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id, studentId, classId, date, status, remarks || null, recordedBy]
    )

    const rows = await executeQuery<Row>(
      `SELECT a.*,
         s.firstName AS student_firstName, s.lastName AS student_lastName, s.registrationNumber AS student_registrationNumber,
         c.name AS class_name, c.form AS class_form, c.stream AS class_stream,
         u.email AS user_email
      FROM attendance a
      LEFT JOIN students s ON s.id = a.studentId
      LEFT JOIN classes c ON c.id = a.classId
      LEFT JOIN users u ON u.id = a.recordedBy
      WHERE a.id = ?`,
      [id]
    )

    return NextResponse.json(transform(rows[0]), { status: 201 })
  } catch (error) {
    console.error('Error creating attendance record:', error)
    return NextResponse.json({ error: 'Failed to create attendance record' }, { status: 500 })
  }
}