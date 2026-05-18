import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'
import { requireRole, AuthError } from '@/lib/auth-session'
import { createNotification } from '@/lib/notifications'
import { createAuditLog } from '@/lib/audit'

interface SubmissionRow {
  id: string
  type: string
  title: string
  status: string
  submittedBy: string
}

// POST /api/approvals/:id/reject  (ADMIN)
// Body: { reason: string }
export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole('ADMIN')
    const { id } = await ctx.params
    const body = await request.json().catch(() => ({}))
    const reason: string = (body?.reason || body?.comments || '').toString().trim()

    if (!reason) {
      return NextResponse.json({ error: 'Rejection reason is required' }, { status: 400 })
    }

    const rows = await executeQuery<SubmissionRow>(
      'SELECT id, type, title, status, submittedBy FROM submissions WHERE id = ? LIMIT 1',
      [id]
    )
    const sub = rows[0]
    if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (sub.status !== 'PENDING') {
      return NextResponse.json({ error: `Submission is ${sub.status}, not PENDING` }, { status: 400 })
    }

    await executeQuery(
      `UPDATE submissions
       SET status = 'REJECTED', reviewedBy = ?, reviewDate = ?, rejectionReason = ?
       WHERE id = ?`,
      [admin.userId, new Date(), reason, id]
    )

    // Log audit entry
    createAuditLog(admin.userId, 'REJECT', 'SUBMISSION', id, `Rejected ${sub.type} submission: ${sub.title} - Reason: ${reason}`).catch(console.error)

    try {
      await createNotification(
        sub.submittedBy,
        'Submission rejected',
        `Your ${sub.type.toLowerCase()} "${sub.title}" was rejected: ${reason}`,
        'WARNING'
      )
    } catch (e) {
      console.error('Notification failed:', e)
    }

    return NextResponse.json({ success: true, id })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error rejecting submission:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
