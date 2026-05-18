import { NextRequest, NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

export async function GET() {
  try {
    // Get total students
    const studentRows = await executeQuery<{ count: number }>(
      'SELECT COUNT(*) AS count FROM students WHERE isActive = 1'
    )
    const totalStudents = studentRows[0]?.count ?? 0

    // Get total teachers
    const teacherRows = await executeQuery<{ count: number }>(
      'SELECT COUNT(*) AS count FROM teachers WHERE isActive = 1'
    )
    const totalTeachers = teacherRows[0]?.count ?? 0

    // Get total parents
    const parentRows = await executeQuery<{ count: number }>(
      'SELECT COUNT(*) AS count FROM parents'
    )
    const totalParents = parentRows[0]?.count ?? 0

    // Get total classes
    const classRows = await executeQuery<{ count: number }>(
      'SELECT COUNT(*) AS count FROM classes WHERE isActive = 1'
    )
    const totalClasses = classRows[0]?.count ?? 0

    // Get pending approvals
    const approvalRows = await executeQuery<{ count: number }>(
      "SELECT COUNT(*) AS count FROM submissions WHERE status = 'PENDING'"
    )
    const pendingApprovals = approvalRows[0]?.count ?? 0

    // Get today's attendance
    const today = new Date().toISOString().split('T')[0]
    const attendanceRows = await executeQuery<{ count: number }>(
      "SELECT COUNT(*) AS count FROM attendance WHERE date = ? AND status = 'PRESENT'",
      [today]
    )
    const todayAttendance = attendanceRows[0]?.count ?? 0

    // Calculate attendance rate
    const attendanceRate = totalStudents > 0 ? ((todayAttendance / totalStudents) * 100).toFixed(1) : '0.0'

    // Get average performance (calculate percentage from score/maxScore)
    const performanceRows = await executeQuery<{ avg: number }>(
      'SELECT AVG((score / maxScore) * 100) AS avg FROM performance WHERE maxScore > 0'
    )
    const averagePerformance = performanceRows[0]?.avg ? performanceRows[0].avg.toFixed(1) : '0.0'

    // Get recent activity (last 5 audit logs)
    const activityRows = await executeQuery<{
      id: string
      action: string
      entityType: string
      details: string | null
      createdAt: string
    }>(
      'SELECT id, action, entityType, details, createdAt FROM audit_logs ORDER BY createdAt DESC LIMIT 5'
    )

    const recentActivity = activityRows.map((row) => ({
      id: row.id,
      type: row.entityType.toLowerCase(),
      description: row.details || `${row.action} ${row.entityType}`,
      time: `${Math.floor((Date.now() - new Date(row.createdAt).getTime()) / 3600000)} hours ago`,
    }))

    return NextResponse.json({
      totalStudents,
      totalTeachers,
      totalParents,
      totalClasses,
      pendingApprovals,
      todayAttendance,
      attendanceRate,
      averagePerformance,
      recentActivity,
    })
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
  }
}
