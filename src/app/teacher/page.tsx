'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout, PageHeader } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRequireAuth } from '@/hooks/use-auth'
import {
  Users,
  GraduationCap,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  Calendar,
  AlertCircle,
  BookOpen,
} from 'lucide-react'

export default function TeacherDashboard() {
  const { user, isAuthorized } = useRequireAuth('TEACHER')
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalClasses: 0,
    pendingApprovals: 0,
    todayAttendance: 0,
    averagePerformance: 0,
    recentSubmissions: 0,
    upcomingEvents: 0,
    unreadNotifications: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])
  const [classes, setClasses] = useState<any[]>([])
  const [submissions, setSubmissions] = useState<any[]>([])

  const loadData = async () => {
    try {
      // Fetch teacher's data - try to find by userId if available, otherwise by email
      const teachersRes = await fetch('/api/teachers')
      if (!teachersRes.ok) throw new Error('Failed to load teacher data')
      const teachersResponse = await teachersRes.json()
      const teachersData = Array.isArray(teachersResponse) ? teachersResponse : (teachersResponse.data || [])
      
      // Try to find teacher by userId first, then by email
      let teacherData = teachersData.find((t: any) => t.userId === user?.id)
      if (!teacherData) {
        teacherData = teachersData.find((t: any) => t.email === user?.email)
      }
      
      if (!teacherData) {
        console.warn('Teacher data not found for user:', user?.email, 'userId:', user?.id)
        setStats({
          totalStudents: 0,
          totalClasses: 0,
          pendingApprovals: 0,
          todayAttendance: 0,
          averagePerformance: 0,
          recentSubmissions: 0,
          upcomingEvents: 0,
          unreadNotifications: 0,
        })
        setClasses([])
        setSubmissions([])
        setIsLoading(false)
        return
      }

      // Fetch classes for this teacher
      const classesRes = await fetch('/api/classes')
      if (!classesRes.ok) throw new Error('Failed to load classes')
      const allClasses = await classesRes.json()
      const teacherClasses = allClasses.filter((c: any) => c.teacherId === teacherData.id)
      setClasses(teacherClasses)

      // Fetch students in teacher's classes
      const studentsRes = await fetch('/api/students')
      if (!studentsRes.ok) throw new Error('Failed to load students')
      const allStudents = await studentsRes.json()
      const teacherStudents = allStudents.filter((s: any) => teacherClasses.some((c: any) => c.id === s.classId))

      // Fetch today's attendance
      const today = new Date().toISOString().slice(0, 10)
      const attendancePromises = teacherClasses.map((c: any) =>
        fetch(`/api/attendance?classId=${c.id}&date=${today}`).then(res => res.json())
      )
      const attendanceResponses = await Promise.all(attendancePromises)
      const attendanceData = attendanceResponses.map((res: any) => res.data || []).flat()
      const presentToday = attendanceData.filter((a: any) => a.status === 'PRESENT').length

      // Fetch performance data
      const performancePromises = teacherClasses.map((c: any) =>
        fetch(`/api/performance?classId=${c.id}`).then(res => res.json())
      )
      const performanceResponses = await Promise.all(performancePromises)
      const performanceData = performanceResponses.map((res: any) => res.data || []).flat()
      const avgPerformance = performanceData.length > 0
        ? performanceData.reduce((sum: number, p: any) => sum + (p.score || 0), 0) / performanceData.length
        : 0

      // Fetch submissions
      const submissionsRes = await fetch('/api/submissions')
      if (submissionsRes.ok) {
        const submissionsData = await submissionsRes.json()
        const teacherSubmissions = submissionsData.filter((s: any) => s.submittedBy === teacherData.userId)
        setSubmissions(teacherSubmissions)
      }

      // Fetch upcoming events
      const eventsRes = await fetch('/api/events?upcoming=1')
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        setUpcomingEvents(eventsData.slice(0, 3))
      }

      // Fetch notifications
      const notificationsRes = await fetch('/api/notifications')
      if (notificationsRes.ok) {
        const notificationsData = await notificationsRes.json()
        const unreadCount = notificationsData.filter((n: any) => !n.read && n.recipientId === teacherData.userId).length
        setStats(prev => ({ ...prev, unreadNotifications: unreadCount }))
      }

      // Update stats
      setStats({
        totalStudents: teacherStudents.length,
        totalClasses: teacherClasses.length,
        pendingApprovals: submissions.filter((s: any) => s.status === 'PENDING').length,
        todayAttendance: presentToday,
        averagePerformance: avgPerformance,
        recentSubmissions: submissions.filter((s: any) => {
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          return new Date(s.createdAt) > weekAgo
        }).length,
        upcomingEvents: upcomingEvents.length,
        unreadNotifications: stats.unreadNotifications,
      })

      // Mock recent activity (would need audit logs for real data)
      setRecentActivity([
        { id: 1, type: 'attendance', description: 'Recorded attendance for class', time: '2 hours ago' },
        { id: 2, type: 'performance', description: 'Added performance scores', time: '3 hours ago' },
      ])
    } catch (error: any) {
      console.error('Error loading teacher data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthorized || !user) return
    loadData()
  }, [isAuthorized, user])

  if (!isAuthorized) {
    return <div>Loading...</div>
  }

  const StatCard = ({ title, value, icon: Icon, description, trend }: any) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-500">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <DashboardLayout title="Teacher Dashboard" subtitle="Manage your classes and student activities">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={GraduationCap}
            description="Students in your classes"
          />
          <StatCard
            title="My Classes"
            value={stats.totalClasses}
            icon={BookOpen}
            description="Classes you teach"
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={Clock}
            description="Waiting for admin approval"
          />
          <StatCard
            title="Today's Attendance"
            value={stats.todayAttendance}
            icon={CheckCircle}
            description={`${stats.totalStudents > 0 ? ((stats.todayAttendance / stats.totalStudents) * 100).toFixed(1) : '0'}% attendance rate`}
          />
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Average Performance"
            value={`${Math.round(stats.averagePerformance)}%`}
            icon={TrendingUp}
            description="Overall student performance"
          />
          <StatCard
            title="Recent Submissions"
            value={stats.recentSubmissions}
            icon={FileText}
            description="Submitted this week"
          />
          <StatCard
            title="Upcoming Events"
            value={stats.upcomingEvents}
            icon={Calendar}
            description="This week"
          />
          <StatCard
            title="Unread Notifications"
            value={stats.unreadNotifications}
            icon={AlertCircle}
            description="Need your attention"
          />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Your latest activities in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {activity.type === 'attendance' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {activity.type === 'performance' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                    {activity.type === 'submission' && <FileText className="h-4 w-4 text-orange-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{activity.description}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>
              Events and meetings scheduled for you
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-sm text-gray-500">Loading events...</div>
            ) : upcomingEvents.length === 0 ? (
              <div className="text-sm text-gray-500">No upcoming events</div>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-blue-500" />
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-gray-500">{event.eventDate} at {event.eventTime || 'TBD'}</p>
                      </div>
                    </div>
                    <Badge variant="outline">Upcoming</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks you can perform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                <h3 className="font-medium">Mark Attendance</h3>
                <p className="text-sm text-gray-500">Record daily attendance</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <TrendingUp className="h-8 w-8 text-blue-500 mb-2" />
                <h3 className="font-medium">Add Performance</h3>
                <p className="text-sm text-gray-500">Record student performance</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <FileText className="h-8 w-8 text-orange-500 mb-2" />
                <h3 className="font-medium">Create Announcement</h3>
                <p className="text-sm text-gray-500">Post new announcement</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <Users className="h-8 w-8 text-purple-500 mb-2" />
                <h3 className="font-medium">View Students</h3>
                <p className="text-sm text-gray-500">See your class students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Class Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>My Classes</CardTitle>
              <CardDescription>
                Classes you are currently teaching
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-sm text-gray-500">Loading classes...</div>
              ) : classes.length === 0 ? (
                <div className="text-sm text-gray-500">No classes assigned</div>
              ) : (
                <div className="space-y-3">
                  {classes.map((classItem) => (
                    <div key={classItem.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <BookOpen className="h-5 w-5 text-blue-500" />
                        <div>
                          <h4 className="font-medium">{classItem.name}</h4>
                          <p className="text-sm text-gray-500">{classItem.form} {classItem.stream}</p>
                        </div>
                      </div>
                      <Badge variant="outline">Active</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Submission Status</CardTitle>
              <CardDescription>
                Status of your recent submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-sm text-gray-500">Loading submissions...</div>
              ) : submissions.length === 0 ? (
                <div className="text-sm text-gray-500">No submissions yet</div>
              ) : (
                <div className="space-y-3">
                  {submissions.slice(0, 3).map((submission) => (
                    <div key={submission.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Clock className={`h-5 w-5 ${submission.status === 'PENDING' ? 'text-yellow-500' : 'text-green-500'}`} />
                        <div>
                          <h4 className="font-medium">{submission.type}</h4>
                          <p className="text-sm text-gray-500">{submission.description || 'No description'}</p>
                        </div>
                      </div>
                      <Badge 
                        variant={submission.status === 'PENDING' ? 'secondary' : 'default'} 
                        className={submission.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}
                      >
                        {submission.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}