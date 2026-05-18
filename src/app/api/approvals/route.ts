import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import { requireRole, AuthError } from '@/lib/auth-session'

interface Row {
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
}

function uiStatus(db: string) { return db === 'PENDING' ? 'PENDING_APPROVAL' : db }
function safeParse(s: string | null) { if (!s) return null; try { return JSON.parse(s) } catch { return null } }

function transform(r: Row) {
  return {
    id: r.id,
    type: r.type,
    title: r.title,
    content: r.content,
    status: uiStatus(r.status),
    data: safeParse(r.data),
    targetAudience: r.targetAudience,
    targetId: r.targetId,
    submittedBy: r.submittedBy,
    submittedByName: `${r.submitterFirstName || ''} ${r.submitterLastName || ''}`.trim(),
    submittedAt: r.createdAt,
    reviewedAt: r.reviewDate,
    rejectionReason: r.rejectionReason,
  }
}

// GET /api/approvals  (ADMIN)
// Default lists PENDING submissions; pass ?status=ALL or specific status to broaden.
export async function GET(request: NextRequest) {
  try {
    await requireRole('ADMIN')
    const { searchParams } = new URL(request.url)
    const statusParam = searchParams.get('status') // ALL | PENDING_APPROVAL | APPROVED | REJECTED | DRAFT
    const type = searchParams.get('type')

    const where: string[] = []
    const params: any[] = []

    if (!statusParam || statusParam === 'PENDING_APPROVAL') {
      where.push('s.status = ?'); params.push('PENDING')
    } else if (statusParam !== 'ALL') {
      where.push('s.status = ?'); params.push(statusParam)
    }
    if (type) { where.push('s.type = ?'); params.push(type) }

    const sql = `
      SELECT s.id, s.type, s.title, s.content, s.status, s.data,
             s.targetAudience, s.targetId,
             s.submittedBy,
             COALESCE(at.firstName, tt.firstName, pt.firstName) AS submitterFirstName,
             COALESCE(at.lastName,  tt.lastName,  pt.lastName)  AS submitterLastName,
             s.reviewedBy, s.reviewDate, s.rejectionReason, s.createdAt
      FROM submissions s
      LEFT JOIN admins   at ON at.userId = s.submittedBy
      LEFT JOIN teachers tt ON tt.userId = s.submittedBy
      LEFT JOIN parents  pt ON pt.userId = s.submittedBy
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY s.createdAt DESC
    `
    const rows = await executeQuery<Row>(sql, params)
    return NextResponse.json(rows.map(transform))
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error listing approvals:', error)
    return NextResponse.json({ error: 'Failed to list approvals' }, { status: 500 })
  }
}
