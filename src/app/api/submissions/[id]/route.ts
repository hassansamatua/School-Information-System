import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import { requireRole, AuthError } from '@/lib/auth-session'

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
  reviewedBy: string | null
  reviewDate: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
}

function uiStatus(db: string) { return db === 'PENDING' ? 'PENDING_APPROVAL' : db }
function safeParse(s: string | null) { if (!s) return null; try { return JSON.parse(s) } catch { return null } }

function transform(r: SubmissionRow) {
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
    submittedAt: r.createdAt,
    reviewedAt: r.reviewDate,
    rejectionReason: r.rejectionReason,
  }
}

// GET /api/submissions/:id
export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(['TEACHER', 'ADMIN'])
    const { id } = await ctx.params
    const rows = await executeQuery<SubmissionRow>(
      'SELECT * FROM submissions WHERE id = ? LIMIT 1',
      [id]
    )
    const sub = rows[0]
    if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (session.role === 'TEACHER' && sub.submittedBy !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json(transform(sub))
  } catch (error) {
    return handle(error, 'fetching submission')
  }
}

// PATCH /api/submissions/:id  (TEACHER, only if DRAFT and own)
// Body may include: title, content, data, targetAudience, targetId, submitNow:boolean
export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole('TEACHER')
    const { id } = await ctx.params
    const body = await req.json()

    const rows = await executeQuery<SubmissionRow>(
      'SELECT * FROM submissions WHERE id = ? LIMIT 1',
      [id]
    )
    const sub = rows[0]
    if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (sub.submittedBy !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (sub.status !== 'DRAFT') {
      return NextResponse.json({ error: 'Only DRAFT submissions can be edited' }, { status: 400 })
    }

    const fields: string[] = []
    const values: any[] = []
    if (typeof body.title === 'string')          { fields.push('title = ?');          values.push(body.title) }
    if (typeof body.content === 'string')        { fields.push('content = ?');        values.push(body.content) }
    if (typeof body.targetAudience === 'string' || body.targetAudience === null) {
      fields.push('targetAudience = ?'); values.push(body.targetAudience || null)
    }
    if (typeof body.targetId === 'string' || body.targetId === null) {
      fields.push('targetId = ?'); values.push(body.targetId || null)
    }
    if (body.data !== undefined) { fields.push('data = ?'); values.push(JSON.stringify(body.data)) }
    if (body.submitNow === true) { fields.push('status = ?'); values.push('PENDING') }

    if (fields.length === 0) {
      return NextResponse.json(transform(sub))
    }

    values.push(id)
    await executeQuery(`UPDATE submissions SET ${fields.join(', ')} WHERE id = ?`, values)

    const updated = await executeQuery<SubmissionRow>(
      'SELECT * FROM submissions WHERE id = ? LIMIT 1',
      [id]
    )
    return NextResponse.json(transform(updated[0]))
  } catch (error) {
    return handle(error, 'updating submission')
  }
}

// DELETE /api/submissions/:id  (TEACHER own DRAFT, or ADMIN)
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireRole(['TEACHER', 'ADMIN'])
    const { id } = await ctx.params
    const rows = await executeQuery<SubmissionRow>(
      'SELECT * FROM submissions WHERE id = ? LIMIT 1',
      [id]
    )
    const sub = rows[0]
    if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (session.role === 'TEACHER') {
      if (sub.submittedBy !== session.userId || sub.status !== 'DRAFT') {
        return NextResponse.json({ error: 'Only own DRAFT submissions can be deleted' }, { status: 403 })
      }
    }
    await executeQuery('DELETE FROM submissions WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    return handle(error, 'deleting submission')
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
