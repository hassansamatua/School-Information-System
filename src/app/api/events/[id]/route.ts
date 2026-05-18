import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import { requireRole, requireSession, AuthError } from '@/lib/auth-session'

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
  createdAt: string
  updatedAt: string
}

function parseJsonArray(s: string | null): any[] {
  if (!s) return []
  try { const v = JSON.parse(s); return Array.isArray(v) ? v : [] } catch { return [] }
}
function transform(r: Row) { return { ...r, attachments: parseJsonArray(r.attachments) } }

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession()
    const { id } = await ctx.params
    const rows = await executeQuery<Row>('SELECT * FROM events WHERE id = ? LIMIT 1', [id])
    const row = rows[0]
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (session.role !== 'ADMIN' && row.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json(transform(row))
  } catch (error) {
    return handle(error, 'fetching event')
  }
}

export async function PATCH(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('ADMIN')
    const { id } = await ctx.params
    const body = await request.json()
    const fields: string[] = []
    const values: any[] = []
    const allowed = ['title', 'description', 'type', 'targetAudience', 'targetId', 'status', 'eventDate', 'eventTime', 'venue']
    for (const key of allowed) {
      if (key in body) { fields.push(`${key} = ?`); values.push(body[key] ?? null) }
    }
    if (fields.length === 0) {
      const rows = await executeQuery<Row>('SELECT * FROM events WHERE id = ? LIMIT 1', [id])
      return NextResponse.json(transform(rows[0]))
    }
    values.push(id)
    await executeQuery(`UPDATE events SET ${fields.join(', ')} WHERE id = ?`, values)
    const rows = await executeQuery<Row>('SELECT * FROM events WHERE id = ? LIMIT 1', [id])
    if (!rows[0]) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(transform(rows[0]))
  } catch (error) {
    return handle(error, 'updating event')
  }
}

export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireRole('ADMIN')
    const { id } = await ctx.params
    await executeQuery('DELETE FROM events WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    return handle(error, 'deleting event')
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
