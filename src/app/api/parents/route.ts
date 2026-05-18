import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { executeQuery, executeTransaction } from '@/lib/mysql'
import bcrypt from 'bcryptjs'

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
  class_name: string | null
}

// GET all parents
export async function GET() {
  try {
    const parents = await executeQuery<ParentRow>(
      `SELECT p.*, u.email AS user_email, u.isActive AS user_isActive
       FROM parents p
       LEFT JOIN users u ON u.id = p.userId
       ORDER BY p.lastName ASC`
    )

    const result = await Promise.all(
      parents.map(async (p) => {
        const students = await executeQuery<StudentRow>(
          `SELECT s.id, s.firstName, s.lastName, s.registrationNumber, c.name AS class_name
           FROM students s
           LEFT JOIN classes c ON c.id = s.classId
           WHERE s.parentId = ?`,
          [p.id]
        )

        const studentCountRows = await executeQuery<{ count: number }>(
          'SELECT COUNT(*) AS count FROM students WHERE parentId = ?',
          [p.id]
        )

        return {
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
          students: students.map(s => ({
            id: s.id,
            firstName: s.firstName,
            lastName: s.lastName,
            registrationNumber: s.registrationNumber,
            className: s.class_name,
          })),
          createdAt: p.createdAt,
        }
      })
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching parents:', error)
    return NextResponse.json({ error: 'Failed to fetch parents' }, { status: 500 })
  }
}

// POST create new parent
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password, phone, occupation, address } = body || {}

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ error: 'First name, last name, email, and password are required' }, { status: 400 })
    }

    const existing = await executeQuery<{ id: string }>('SELECT id FROM users WHERE email = ? LIMIT 1', [email])
    if (existing[0]) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    const userId = uuid()
    const parentId = uuid()

    await executeTransaction([
      { query: 'INSERT INTO users (id, email, password, role, isActive) VALUES (?, ?, ?, ?, 1)', params: [userId, email, hashedPassword, 'PARENT'] },
      { query: 'INSERT INTO parents (id, userId, firstName, lastName, phone, occupation, address, isApproved) VALUES (?, ?, ?, ?, ?, ?, ?, 0)', params: [parentId, userId, firstName, lastName, phone || null, occupation || null, address || null] },
    ])

    const parents = await executeQuery<ParentRow>(
      `SELECT p.*, u.email AS user_email, u.isActive AS user_isActive
       FROM parents p
       LEFT JOIN users u ON u.id = p.userId
       WHERE p.id = ? LIMIT 1`,
      [parentId]
    )

    const studentCountRows = await executeQuery<{ count: number }>(
      'SELECT COUNT(*) AS count FROM students WHERE parentId = ?',
      [parentId]
    )

    const p = parents[0]
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
      students: [],
      createdAt: p.createdAt,
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating parent:', error)
    return NextResponse.json({ error: 'Failed to create parent' }, { status: 500 })
  }
}