import { NextRequest, NextResponse } from 'next/server'
import { v4 as uuid } from 'uuid'
import { executeQuery, executeTransaction } from '@/lib/mysql'
import { requireRole, AuthError } from '@/lib/auth-session'
import { createNotification } from '@/lib/notifications'
import { createAuditLog } from '@/lib/audit'

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
}

function safeParse(s: string | null): any { if (!s) return null; try { return JSON.parse(s) } catch { return null } }

// POST /api/approvals/:id/approve   (ADMIN)
// Marks submission APPROVED, writes role-specific published rows, notifies submitter.
export async function POST(request: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireRole('ADMIN')
    const { id } = await ctx.params
    const body = await request.json().catch(() => ({}))
    const comments: string | undefined = body?.comments

    const rows = await executeQuery<SubmissionRow>(
      'SELECT * FROM submissions WHERE id = ? LIMIT 1',
      [id]
    )
    const sub = rows[0]
    if (!sub) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (sub.status !== 'PENDING') {
      return NextResponse.json({ error: `Submission is ${sub.status}, not PENDING` }, { status: 400 })
    }

    const data = safeParse(sub.data) || {}
    const now = new Date()

    // Build the publish queries based on submission type.
    const publishQueries: { query: string; params: any[] }[] = []

    switch (sub.type) {
      case 'ANNOUNCEMENT': {
        publishQueries.push({
          query: `INSERT INTO announcements
                    (id, title, content, type, targetAudience, targetId, status,
                     attachments, publishedAt, postedBy, approvedBy)
                  VALUES (?, ?, ?, ?, ?, ?, 'PUBLISHED', '[]', ?, ?, ?)`,
          params: [
            uuid(),
            sub.title,
            sub.content,
            (data.announcementType || 'GENERAL'),
            sub.targetAudience || 'ALL',
            sub.targetId || null,
            now,
            sub.submittedBy,
            admin.userId,
          ],
        })
        break
      }
      case 'EVENT': {
        if (!data.eventDate) {
          return NextResponse.json({ error: 'Submission missing data.eventDate' }, { status: 400 })
        }
        publishQueries.push({
          query: `INSERT INTO events
                    (id, title, description, type, targetAudience, targetId, status,
                     attachments, eventDate, eventTime, venue, postedBy, approvedBy)
                  VALUES (?, ?, ?, ?, ?, ?, 'PUBLISHED', '[]', ?, ?, ?, ?, ?)`,
          params: [
            uuid(),
            sub.title,
            sub.content,
            (data.eventType || 'GENERAL'),
            sub.targetAudience || 'ALL',
            sub.targetId || null,
            data.eventDate,
            data.eventTime || null,
            data.venue || null,
            sub.submittedBy,
            admin.userId,
          ],
        })
        break
      }
      case 'PERFORMANCE': {
        // data.records: [{ studentId, classId, subject, assessmentType, score, maxScore, grade?, remarks?, assessmentDate }, ...]
        const records: any[] = Array.isArray(data.records) ? data.records : []
        for (const r of records) {
          if (!r.studentId || !r.classId || !r.subject || !r.assessmentType ||
              r.score == null || r.maxScore == null || !r.assessmentDate) {
            return NextResponse.json({ error: 'Invalid performance record in data.records' }, { status: 400 })
          }
          publishQueries.push({
            query: `INSERT INTO performance
                      (id, subject, assessmentType, score, maxScore, grade, remarks,
                       assessmentDate, studentId, classId, recordedBy)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            params: [
              uuid(),
              r.subject,
              r.assessmentType,
              r.score,
              r.maxScore,
              r.grade || null,
              r.remarks || null,
              r.assessmentDate,
              r.studentId,
              r.classId,
              sub.submittedBy,
            ],
          })
        }
        break
      }
      case 'ATTENDANCE': {
        // data.records: [{ studentId, classId, date, status, remarks? }, ...]
        const records: any[] = Array.isArray(data.records) ? data.records : []
        for (const r of records) {
          if (!r.studentId || !r.classId || !r.date || !r.status) {
            return NextResponse.json({ error: 'Invalid attendance record in data.records' }, { status: 400 })
          }
          publishQueries.push({
            query: `INSERT INTO attendance
                      (id, date, status, remarks, studentId, classId, recordedBy)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                      status = VALUES(status),
                      remarks = VALUES(remarks),
                      recordedBy = VALUES(recordedBy)`,
            params: [
              uuid(),
              r.date,
              r.status,
              r.remarks || null,
              r.studentId,
              r.classId,
              sub.submittedBy,
            ],
          })
        }
        break
      }
      case 'REPORT':
      case 'OTHER':
        // No additional published artifact — approval alone is sufficient.
        break
      default:
        return NextResponse.json({ error: `Unknown submission type ${sub.type}` }, { status: 400 })
    }

    // Always finish by marking the submission approved.
    publishQueries.push({
      query: `UPDATE submissions
              SET status = 'APPROVED', reviewedBy = ?, reviewDate = ?, rejectionReason = ?
              WHERE id = ?`,
      params: [admin.userId, now, comments || null, id],
    })

    await executeTransaction(publishQueries)

    // Log audit entry
    createAuditLog(admin.userId, 'APPROVE', 'SUBMISSION', id, `Approved ${sub.type} submission: ${sub.title}`).catch(console.error)

    // Notify the submitter (best-effort; failures don't roll the transaction back).
    try {
      await createNotification(
        sub.submittedBy,
        'Submission approved',
        `Your ${sub.type.toLowerCase()} "${sub.title}" was approved.`,
        'SUCCESS'
      )
    } catch (e) {
      console.error('Notification failed:', e)
    }

    return NextResponse.json({ success: true, id })
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status })
    }
    console.error('Error approving submission:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
