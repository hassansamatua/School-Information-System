import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import { requireSession, AuthError } from '@/lib/auth-session'

// PATCH /api/notifications/:id
// Marks a specific notification as read
export async function PATCH(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession()
    const { id } = await ctx.params

    const rows = await executeQuery<{ userId: string }>('SELECT userId FROM notifications WHERE id = ? LIMIT 1', [id])
    const row = rows[0]
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (row.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await executeQuery('UPDATE notifications SET isRead = 1 WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error marking notification as read:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// DELETE /api/notifications/:id
// Deletes a specific notification
export async function DELETE(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await requireSession()
    const { id } = await ctx.params

    const rows = await executeQuery<{ userId: string }>('SELECT userId FROM notifications WHERE id = ? LIMIT 1', [id])
    const row = rows[0]
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (row.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await executeQuery('DELETE FROM notifications WHERE id = ?', [id])
    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error deleting notification:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
