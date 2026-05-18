import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import { requireSession, AuthError } from '@/lib/auth-session'

interface Row {
  id: string
  title: string
  message: string
  type: string
  isRead: number
  userId: string
  createdAt: string
}

function transform(r: Row) {
  return {
    id: r.id,
    title: r.title,
    message: r.message,
    type: r.type,
    isRead: Boolean(r.isRead),
    userId: r.userId,
    createdAt: r.createdAt,
  }
}

// GET /api/notifications
// Returns notifications for the current user, newest first
export async function GET(request: NextRequest) {
  try {
    const session = await requireSession()
    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unreadOnly') === '1'

    const sql = unreadOnly
      ? 'SELECT * FROM notifications WHERE userId = ? AND isRead = 0 ORDER BY createdAt DESC'
      : 'SELECT * FROM notifications WHERE userId = ? ORDER BY createdAt DESC'

    const rows = await executeQuery<Row>(sql, [session.userId])
    return NextResponse.json(rows.map(transform))
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error listing notifications:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH /api/notifications/read-all
// Marks all notifications for the current user as read
export async function PATCH(request: NextRequest) {
  try {
    const session = await requireSession()
    const body = await request.json()
    const action = body?.action

    if (action === 'read-all') {
      await executeQuery('UPDATE notifications SET isRead = 1 WHERE userId = ?', [session.userId])
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error updating notifications:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
