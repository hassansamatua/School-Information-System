import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { executeQuery } from '@/lib/mysql'
import { requireRole, AuthError } from '@/lib/auth-session'
import { createAuditLog } from '@/lib/audit'

const VALID_TYPES = ['ANNOUNCEMENT', 'EVENT', 'REPORT', 'ATTENDANCE', 'PERFORMANCE', 'OTHER'] as const
type SubmissionType = typeof VALID_TYPES[number]

// UI uses 'PENDING_APPROVAL', DB stores 'PENDING'. Normalize both directions.
function uiStatus(db: string): string {
  return db === 'PENDING' ? 'PENDING_APPROVAL' : db
}
function dbStatus(ui: string): string {
  return ui === 'PENDING_APPROVAL' ? 'PENDING' : ui
}

interface SubmissionRow {
  id: string
  type: string
  title: string
  content: string
  status: string
  data: string | null
  targetAudience: string | null
  targetId: string | null
  submittedBy: string
  submitterFirstName: string | null
  submitterLastName: string | null
  reviewedBy: string | null
  reviewDate: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
}

function transform(r: SubmissionRow) {
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    content: r.content,
    status: uiStatus(r.status),
    data: r.data ? safeParse(r.data) : null,
    targetAudience: r.targetAudience,
    targetId: r.targetId,
    submittedBy: r.submittedBy,
    submittedByName: `${r.submitterFirstName || ''} ${r.submitterLastName || ''}`.trim(),
    submittedAt: r.createdAt,
    reviewedAt: r.reviewDate,
    rejectionReason: r.rejectionReason,
  }
}

function safeParse(s: string) {
  try { return JSON.parse(s) } catch { return null }
}

const SELECT_SUBMISSION = `
  SELECT s.id, s.type, s.title, s.content, s.status, s.data,
         s.targetAudience, s.targetId,
         s.submittedBy,
         COALESCE(at.firstName, tt.firstName, pt.firstName) AS submitterFirstName,
         COALESCE(at.lastName,  tt.lastName,  pt.lastName)  AS submitterLastName,
         s.reviewedBy, s.reviewDate, s.rejectionReason,
         s.createdAt, s.updatedAt
  FROM submissions s
  LEFT JOIN admins   at ON at.userId = s.submittedBy
  LEFT JOIN teachers tt ON tt.userId = s.submittedBy
  LEFT JOIN parents  pt ON pt.userId = s.submittedBy
`

// GET /api/submissions
// - Teacher: own submissions
// - Admin: all (optional filters: ?status=, ?type=, ?submittedBy=)
export async function GET(request: NextRequest) {
  try {
    const ctx = await requireRole(['TEACHER', 'ADMIN'])
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const type = searchParams.get('type')
    const submittedBy = searchParams.get('submittedBy')

    const where: string[] = []
    const params: any[] = []

    if (ctx.role === 'TEACHER') {
      where.push('s.submittedBy = ?')
      params.push(ctx.userId)
    } else if (submittedBy) {
      where.push('s.submittedBy = ?')
      params.push(submittedBy)
    }

    if (status) {
      where.push('s.status = ?')
      params.push(dbStatus(status))
    }
    if (type) {
      where.push('s.type = ?')
      params.push(type)
    }

    const sql = `${SELECT_SUBMISSION}${where.length ? ' WHERE ' + where.join(' AND ') : ''} ORDER BY s.createdAt DESC`
    const rows = await executeQuery<SubmissionRow>(sql, params)
    return NextResponse.json(rows.map(transform))
  } catch (error) {
    return handle(error, 'listing submissions')
  }
}

// POST /api/submissions  (TEACHER)
// Body: { type, title, content, targetAudience?, targetId?, data?, submitNow?: boolean }
export async function POST(request: NextRequest) {
  try {
    const ctx = await requireRole('TEACHER')
    const body = await request.json()
    const { type, title, content, targetAudience, targetId, data, submitNow } = body || {}

    if (!type || !VALID_TYPES.includes(type as SubmissionType)) {
      return NextResponse.json({ error: 'Invalid submission type' }, { status: 400 })
    }
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 })
    }

    const id = uuid()
    const status = submitNow ? 'PENDING' : 'DRAFT'

    await executeQuery(
      `INSERT INTO submissions
         (id, type, title, content, status, data, targetAudience, targetId, submittedBy)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        type,
        title,
        content,
        status,
        data ? JSON.stringify(data) : '{}',
        targetAudience || null,
        targetId || null,
        ctx.userId,
      ]
    )

    // Log audit entry
    createAuditLog(ctx.userId, 'CREATE', 'SUBMISSION', id, `Created ${type} submission: ${title} (status: ${status})`).catch(console.error)

    const rows = await executeQuery<SubmissionRow>(
      `${SELECT_SUBMISSION} WHERE s.id = ?`,
      [id]
    )
    return NextResponse.json(transform(rows[0]), { status: 201 })
  } catch (error) {
    return handle(error, 'creating submission')
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
