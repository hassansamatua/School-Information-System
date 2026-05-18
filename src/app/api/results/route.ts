import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { executeQuery } from '@/lib/mysql'

interface Row {
  id: string
  studentId: string
  classId: string
  examType: string
  term: string
  academicYear: string
  subjects: string
  totalMarks: number
  maxTotalMarks: number
  percentage: number
  grade: string
  rank: number | null
  remarks: string | null
  publishedAt: string
  publishedBy: string
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
    examType: r.examType,
    term: r.term,
    academicYear: r.academicYear,
    subjects: r.subjects,
    totalMarks: r.totalMarks,
    maxTotalMarks: r.maxTotalMarks,
    percentage: r.percentage,
    grade: r.grade,
    rank: r.rank,
    remarks: r.remarks,
    publishedAt: r.publishedAt,
    publishedBy: r.publishedBy,
    publishedByUser: r.user_email,
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

// GET results
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const studentId = searchParams.get('studentId')
    const classId = searchParams.get('classId')
    const examType = searchParams.get('examType')
    const term = searchParams.get('term')
    const academicYear = searchParams.get('academicYear')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    const where: string[] = []
    const params: any[] = []

    if (studentId) { where.push('r.studentId = ?'); params.push(studentId) }
    if (classId) { where.push('r.classId = ?'); params.push(classId) }
    if (examType) { where.push('r.examType = ?'); params.push(examType) }
    if (term) { where.push('r.term = ?'); params.push(term) }
    if (academicYear) { where.push('r.academicYear = ?'); params.push(academicYear) }

    const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : ''
    const offset = (page - 1) * limit

    const [rows, countRows] = await Promise.all([
      executeQuery<Row>(
        `SELECT r.*,
           s.firstName AS student_firstName, s.lastName AS student_lastName, s.registrationNumber AS student_registrationNumber,
           c.name AS class_name, c.form AS class_form, c.stream AS class_stream,
           u.email AS user_email
        FROM results r
        LEFT JOIN students s ON s.id = r.studentId
        LEFT JOIN classes c ON c.id = r.classId
        LEFT JOIN users u ON u.id = r.publishedBy
        ${whereClause}
        ORDER BY r.publishedAt DESC
        LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      ),
      executeQuery<{ total: number }>(
        `SELECT COUNT(*) AS total FROM results r ${whereClause}`,
        params
      ),
    ])

    const total = countRows[0]?.total ?? 0

    return NextResponse.json({
      data: rows.map(transform),
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Error fetching results:', error)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}

// POST create result
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { studentId, classId, examType, term, academicYear, subjects, totalMarks, maxTotalMarks, remarks, publishedBy } = body || {}

    if (!studentId || !classId || !examType || !term || !academicYear || !subjects || totalMarks === undefined || !maxTotalMarks || !publishedBy) {
      return NextResponse.json({ error: 'All required fields must be provided' }, { status: 400 })
    }

    if (totalMarks < 0 || totalMarks > maxTotalMarks) {
      return NextResponse.json({ error: 'Total marks must be between 0 and max total marks' }, { status: 400 })
    }

    const percentage = Math.round((totalMarks / maxTotalMarks) * 100)
    const grade = calculateGrade(percentage)

    const id = uuid()
    const now = new Date().toISOString()
    await executeQuery(
      `INSERT INTO results (id, studentId, classId, examType, term, academicYear, subjects, totalMarks, maxTotalMarks, percentage, grade, remarks, publishedAt, publishedBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, studentId, classId, examType, term, academicYear, subjects, totalMarks, maxTotalMarks, percentage, grade, remarks || null, now, publishedBy]
    )

    const rows = await executeQuery<Row>(
      `SELECT r.*,
         s.firstName AS student_firstName, s.lastName AS student_lastName, s.registrationNumber AS student_registrationNumber,
         c.name AS class_name, c.form AS class_form, c.stream AS class_stream,
         u.email AS user_email
      FROM results r
      LEFT JOIN students s ON s.id = r.studentId
      LEFT JOIN classes c ON c.id = r.classId
      LEFT JOIN users u ON u.id = r.publishedBy
      WHERE r.id = ?`,
      [id]
    )

    return NextResponse.json(transform(rows[0]), { status: 201 })
  } catch (error) {
    console.error('Error creating result:', error)
    return NextResponse.json({ error: 'Failed to create result' }, { status: 500 })
  }
}