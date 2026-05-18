import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { executeQuery } from '@/lib/mysql'

interface Row {
  id: string
  studentId: string
  classId: string
  subject: string
  assessmentType: string
  score: number
  maxScore: number
  grade: string
  remarks: string | null
  assessmentDate: string
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
    subject: r.subject,
    assessmentType: r.assessmentType,
    score: r.score,
    maxScore: r.maxScore,
    percentage: Math.round((r.score / r.maxScore) * 100),
    grade: r.grade,
    remarks: r.remarks,
    assessmentDate: r.assessmentDate,
    recordedBy: r.recordedBy,
    recordedByUser: r.user_email,
    createdAt: r.createdAt,
  }
}

function calculateGrade(percentage: number): string {
  if (percentage >= 90) return 'A+'
  if (percentage >= 85) return 'A'
  if (percentage >= 80) return 'A-'
  if (percentage >= 75) return 'B+'
  if (percentage >= 70) return 'B'
  if (percentage >= 65) return 'B-'
  if (percentage >= 60) return 'C+'
  if (percentage >= 55) return 'C'
  if (percentage >= 50) return 'C-'
  if (percentage >= 45) return 'D'
  if (percentage >= 40) return 'E'
  return 'F'
}

// GET performance records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const classId = searchParams.get('classId')
    const subject = searchParams.get('subject')
    const assessmentType = searchParams.get('assessmentType')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: string[] = []
    const params: any[] = []

    if (studentId) { where.push('p.studentId = ?'); params.push(studentId) }
    if (classId) { where.push('p.classId = ?'); params.push(classId) }
    if (subject) { where.push('p.subject LIKE ?'); params.push(`%${subject}%`) }
    if (assessmentType) { where.push('p.assessmentType = ?'); params.push(assessmentType) }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : ''
    const offset = (page - 1) * limit

    const [rows, countRows] = await Promise.all([
      executeQuery<Row>(
        `SELECT p.*,
           s.firstName AS student_firstName, s.lastName AS student_lastName, s.registrationNumber AS student_registrationNumber,
           c.name AS class_name, c.form AS class_form, c.stream AS class_stream,
           u.email AS user_email
        FROM performance p
        LEFT JOIN students s ON s.id = p.studentId
        LEFT JOIN classes c ON c.id = p.classId
        LEFT JOIN users u ON u.id = p.recordedBy
        ${whereClause}
        ORDER BY p.assessmentDate DESC
        LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      ),
      executeQuery<{ total: number }>(
        `SELECT COUNT(*) AS total FROM performance p ${whereClause}`,
        params
      ),
    ])

    const total = countRows[0]?.total ?? 0

    return NextResponse.json({
      data: rows.map(transform),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Error fetching performance:', error)
    return NextResponse.json({ error: 'Failed to fetch performance' }, { status: 500 })
  }
}

// POST create performance record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, classId, subject, assessmentType, score, maxScore, remarks, assessmentDate, recordedBy } = body || {}

    if (!studentId || !classId || !subject || !assessmentType || score === undefined || !maxScore || !assessmentDate || !recordedBy) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 })
    }

    if (score < 0 || score > maxScore) {
      return NextResponse.json({ error: 'Score must be between 0 and max score' }, { status: 400 })
    }

    const percentage = Math.round((score / maxScore) * 100)
    const grade = calculateGrade(percentage)

    const id = uuid()
    await executeQuery(
      `INSERT INTO performance (id, studentId, classId, subject, assessmentType, score, maxScore, grade, remarks, assessmentDate, recordedBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, studentId, classId, subject, assessmentType, score, maxScore, grade, remarks || null, assessmentDate, recordedBy]
    )

    const rows = await executeQuery<Row>(
      `SELECT p.*,
         s.firstName AS student_firstName, s.lastName AS student_lastName, s.registrationNumber AS student_registrationNumber,
         c.name AS class_name, c.form AS class_form, c.stream AS class_stream,
         u.email AS user_email
      FROM performance p
      LEFT JOIN students s ON s.id = p.studentId
      LEFT JOIN classes c ON c.id = p.classId
      LEFT JOIN users u ON u.id = p.recordedBy
      WHERE p.id = ?`,
      [id]
    )

    return NextResponse.json({ ...transform(rows[0]), percentage }, { status: 201 })
  } catch (error) {
    console.error('Error creating performance record:', error)
    return NextResponse.json({ error: 'Failed to create performance record' }, { status: 500 })
  }
}