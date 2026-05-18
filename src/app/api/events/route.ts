import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { executeQuery } from '@/lib/mysql'
import { requireRole, requireSession, AuthError } from '@/lib/auth-session'

const VALID_TYPES = ['GENERAL', 'ACADEMIC', 'SPORTS', 'CULTURAL', 'MEETING', 'HOLIDAY']
const VALID_AUDIENCES = ['ALL', 'TEACHERS', 'PARENTS', 'SPECIFIC_CLASS', 'SPECIFIC_STUDENT', 'SPECIFIC']

interface Row {
  id: string
  title: string
  description: string
  type: string
  targetAudience: string
  targetId: string | null
  status: string
  attachments: string | null
  eventDate: string
  eventTime: string | null
  venue: string | null
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
    description: r.description,
    type: r.type,
    targetAudience: r.targetAudience,
    targetId: r.targetId,
    status: r.status,
    attachments: parseJsonArray(r.attachments),
    eventDate: r.eventDate,
    eventTime: r.eventTime,
    venue: r.venue,
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
  SELECT e.*,
         COALESCE(ad.firstName, t.firstName, p.firstName) AS posterFirstName,
         COALESCE(ad.lastName,  t.lastName,  p.lastName)  AS posterLastName
  FROM events e
  LEFT JOIN admins   ad ON ad.userId = e.postedBy
  LEFT JOIN teachers t  ON t.userId  = e.postedBy
  LEFT JOIN parents  p  ON p.userId  = e.postedBy
`

// GET /api/events
export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const upcoming = searchParams.get('upcoming') === '1'

    const where: string[] = []
    const params: any[] = []

    if (session.role === 'ADMIN') {
      if (status) { where.push('e.status = ?'); params.push(status) }
      if (type) { where.push('e.type = ?'); params.push(type) }
    } else {
      where.push("e.status = 'PUBLISHED'")
      if (session.role === 'TEACHER') {
        where.push("e.targetAudience IN ('ALL', 'TEACHERS')")
      } else if (session.role === 'PARENT') {
        // Parent sees: ALL, PARENTS, SPECIFIC_CLASS (only when targetId contains their child's classId),
        // SPECIFIC_STUDENT (only when targetId contains their child's id), SPECIFIC (only when targetId contains their userId)
        // targetId may be a comma-separated list of IDs
        where.push(`(
          e.targetAudience IN ('ALL', 'PARENTS')
          OR (e.targetAudience = 'SPECIFIC_CLASS' AND EXISTS (
            SELECT 1 FROM students s
            WHERE s.parentId IN (SELECT id FROM parents WHERE userId = ?)
              AND FIND_IN_SET(s.classId, e.targetId) > 0
          ))
          OR (e.targetAudience = 'SPECIFIC_STUDENT' AND EXISTS (
            SELECT 1 FROM students s
            WHERE s.parentId IN (SELECT id FROM parents WHERE userId = ?)
              AND FIND_IN_SET(s.id, e.targetId) > 0
          ))
          OR (e.targetAudience = 'SPECIFIC' AND FIND_IN_SET(?, e.targetId) > 0)
        )`)
        params.push(session.userId, session.userId, session.userId)
      }
    }
    if (upcoming) where.push('e.eventDate >= CURDATE()')

    const sql = `${SELECT}${where.length ? ' WHERE ' + where.join(' AND ') : ''} ORDER BY e.eventDate ASC, e.eventTime ASC`
    const rows = await executeQuery<Row>(sql, params)
    return NextResponse.json(rows.map(transform))
  } catch (error) {
    return handle(error, 'listing events')
  }
}

// POST /api/events  (ADMIN)
// Body: { title, description, type, targetAudience, targetId?, eventDate, eventTime?, venue?, status? }
export async function POST(request: NextRequest) {
  try {
    const admin = await requireRole('ADMIN')
    const body = await request.json()
    const { title, description, type, targetAudience, targetId, eventDate, eventTime, venue } = body || {}
    const status: string = body?.status || 'PUBLISHED'

    if (!title || !description) {
      return NextResponse.json({ error: 'Title and description are required' }, { status: 400 })
    }
    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: `Invalid type` }, { status: 400 })
    }
    if (!targetAudience || !VALID_AUDIENCES.includes(targetAudience)) {
      return NextResponse.json({ error: 'Invalid targetAudience' }, { status: 400 })
    }
    if (!eventDate) {
      return NextResponse.json({ error: 'eventDate is required (YYYY-MM-DD)' }, { status: 400 })
    }

    const id = uuid()
    await executeQuery(
      `INSERT INTO events
         (id, title, description, type, targetAudience, targetId, status,
          attachments, eventDate, eventTime, venue, postedBy, approvedBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, '[]', ?, ?, ?, ?, ?)`,
      [
        id, title, description, type, targetAudience, targetId || null, status,
        eventDate, eventTime || null, venue || null, admin.userId, admin.userId,
      ]
    )

    const rows = await executeQuery<Row>(`${SELECT} WHERE e.id = ?`, [id])
    return NextResponse.json(transform(rows[0]), { status: 201 })
  } catch (error) {
    return handle(error, 'creating event')
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
