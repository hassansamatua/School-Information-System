import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { executeQuery } from '@/lib/mysql'
import { requireRole, requireSession, AuthError } from '@/lib/auth-session'

const VALID_TYPES = ['GENERAL', 'URGENT', 'ACADEMIC', 'EVENT', 'POLICY']
const VALID_AUDIENCES = ['ALL', 'TEACHERS', 'PARENTS', 'SPECIFIC_CLASS', 'SPECIFIC_STUDENT', 'SPECIFIC']

interface Row {
  id: string
  title: string
  content: string
  type: string
  targetAudience: string
  targetId: string | null
  status: string
  attachments: string | null
  publishedAt: string | null
  expiresAt: string | null
  rejectionReason: string | null
  postedBy: string | null
  approvedBy: string | null
  posterFirstName: string | null
  posterLastName: string | null
  createdAt: string
  updatedAt: string
}

function transform(r: Row) {
  return {
    id: r.id,
    title: r.title,
    content: r.content,
    type: r.type,
    targetAudience: r.targetAudience,
    targetId: r.targetId,
    status: r.status,
    attachments: parseJsonArray(r.attachments),
    publishedAt: r.publishedAt,
    expiresAt: r.expiresAt,
    rejectionReason: r.rejectionReason,
    postedBy: r.postedBy,
    postedByName: `${r.posterFirstName || ''} ${r.posterLastName || ''}`.trim(),
    approvedBy: r.approvedBy,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }
}

function parseJsonArray(s: string | null): any[] {
  if (!s) return []
  try { const v = JSON.parse(s); return Array.isArray(v) ? v : [] } catch { return [] }
}

const SELECT = `
  SELECT a.*, 
         COALESCE(ad.firstName, t.firstName, p.firstName) AS posterFirstName,
         COALESCE(ad.lastName,  t.lastName,  p.lastName)  AS posterLastName
  FROM announcements a
  LEFT JOIN admins   ad ON ad.userId = a.postedBy
  LEFT JOIN teachers t  ON t.userId  = a.postedBy
  LEFT JOIN parents  p  ON p.userId  = a.postedBy
`

// GET /api/announcements
//   Admin sees everything (filterable by ?status=, ?type=).
//   Teacher/Parent sees only PUBLISHED announcements scoped to their audience.
export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')

    const where: string[] = []
    const params: any[] = []

    if (session.role === 'ADMIN') {
      if (status) { where.push('a.status = ?'); params.push(status) }
      if (type) { where.push('a.type = ?'); params.push(type) }
    } else {
      where.push("a.status = 'PUBLISHED'")
      if (session.role === 'TEACHER') {
        where.push("a.targetAudience IN ('ALL', 'TEACHERS')")
      } else if (session.role === 'PARENT') {
        // Parent sees: ALL, PARENTS, SPECIFIC_CLASS (only when targetId contains their child's classId),
        // SPECIFIC_STUDENT (only when targetId contains their child's id), SPECIFIC (only when targetId contains their userId)
        // targetId may be a comma-separated list of IDs
        where.push(`(
          a.targetAudience IN ('ALL', 'PARENTS')
          OR (a.targetAudience = 'SPECIFIC_CLASS' AND EXISTS (
            SELECT 1 FROM students s
            WHERE s.parentId IN (SELECT id FROM parents WHERE userId = ?)
              AND FIND_IN_SET(s.classId, a.targetId) > 0
          ))
          OR (a.targetAudience = 'SPECIFIC_STUDENT' AND EXISTS (
            SELECT 1 FROM students s
            WHERE s.parentId IN (SELECT id FROM parents WHERE userId = ?)
              AND FIND_IN_SET(s.id, a.targetId) > 0
          ))
          OR (a.targetAudience = 'SPECIFIC' AND FIND_IN_SET(?, a.targetId) > 0)
        )`)
        params.push(session.userId, session.userId, session.userId)
      }
    }

    const sql = `${SELECT}${where.length ? ' WHERE ' + where.join(' AND ') : ''} ORDER BY COALESCE(a.publishedAt, a.createdAt) DESC`
    const rows = await executeQuery<Row>(sql, params)
    return NextResponse.json(rows.map(transform))
  } catch (error) {
    return handle(error, 'listing announcements')
  }
}

// POST /api/announcements  (ADMIN only — direct publish)
// Body: { title, content, type, targetAudience, targetId?, expiresAt?, status? }
export async function POST(request: NextRequest) {
  try {
    const admin = await requireRole('ADMIN')
    const body = await request.json()
    const { title, content, type, targetAudience, targetId, expiresAt } = body || {}
    const status: string = body?.status || 'PUBLISHED'

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }
    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: `Invalid type (must be one of ${VALID_TYPES.join(', ')})` }, { status: 400 })
    }
    if (!targetAudience || !VALID_AUDIENCES.includes(targetAudience)) {
      return NextResponse.json({ error: 'Invalid targetAudience' }, { status: 400 })
    }

    const id = uuid()
    const publishedAt = status === 'PUBLISHED' ? new Date() : null

    await executeQuery(
      `INSERT INTO announcements
         (id, title, content, type, targetAudience, targetId, status,
          attachments, publishedAt, expiresAt, postedBy, approvedBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, '[]', ?, ?, ?, ?)`,
      [
        id, title, content, type, targetAudience, targetId || null, status,
        publishedAt, expiresAt || null, admin.userId, admin.userId,
      ]
    )

    const rows = await executeQuery<Row>(`${SELECT} WHERE a.id = ?`, [id])
    return NextResponse.json(transform(rows[0]), { status: 201 })
  } catch (error) {
    return handle(error, 'creating announcement')
  }
}

function handle(error: unknown, context: string) {
  if (error instanceof AuthError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }
  console.error(`Error ${context}:`, error)
  const message = error instanceof Error ? error.message : 'Unknown error'
  return NextResponse.json({ error: message, context }, { status: 500 })
}
