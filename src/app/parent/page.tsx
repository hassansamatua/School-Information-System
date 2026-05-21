'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout, PageHeader } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRequireAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import {
  Users,
  GraduationCap,
  CheckCircle,
  TrendingUp,
  Calendar,
  Bell,
  AlertCircle,
  BookOpen,
  Clock,
  Award,
} from 'lucide-react'

interface Student {
  id: string
  firstName: string
  lastName: string
  registrationNumber: string
  classId: string | null
  className: string | null
}

interface Attendance {
  id: string
  studentId: string
  date: string
  status: string
}

interface Performance {
  id: string
  studentId: string
  subject: string
  score: number
  maxScore: number
  grade: string
  assessmentDate: string
}

interface Result {
  id: string
  studentId: string
  examType: string
  term: string
  academicYear: string
  totalMarks: number
  maxTotalMarks: number
  percentage: number
  grade: string
  publishedAt: string
}

export default function ParentDashboard() {
  const { user, isAuthorized } = useRequireAuth('PARENT')
  const [isLoading, setIsLoading] = useState(true)
  const [children, setChildren] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Attendance[]>([])
  const [performance, setPerformance] = useState<Performance[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  const loadData = async () => {
    try {
      // Fetch parent's children
      const parentsRes = await fetch('/api/parents')
      if (!parentsRes.ok) throw new Error('Failed to load parent data')
      const parentsData = await parentsRes.json()
      const parentData = parentsData.find((p: any) => p.email === user?.email)
      
      if (!parentData) {
        throw new Error('Parent data not found')
      }

      // Fetch children
      const studentsRes = await fetch('/api/students')
      if (!studentsRes.ok) throw new Error('Failed to load students')
      const allStudents = await studentsRes.json()
      const parentChildren = allStudents.filter((s: any) => s.parentId === parentData.id)
      setChildren(parentChildren)

      // Fetch attendance for children
      if (parentChildren.length > 0) {
        const attendancePromises = parentChildren.map((child: Student) =>
          fetch(`/api/attendance?studentId=${child.id}`).then(res => res.json())
        )
        const attendanceData = await Promise.all(attendancePromises)
        setAttendance(attendanceData.flatMap((response: any) => response.data || []))

        // Fetch performance for children
        const performancePromises = parentChildren.map((child: Student) =>
          fetch(`/api/performance?studentId=${child.id}`).then(res => res.json())
        )
        const performanceData = await Promise.all(performancePromises)
        setPerformance(performanceData.flatMap((response: any) => response.data || []))

        // Fetch results for children
        const resultsPromises = parentChildren.map((child: Student) =>
          fetch(`/api/results?studentId=${child.id}`).then(res => res.json())
        )
        const resultsData = await Promise.all(resultsPromises)
        setResults(resultsData.flatMap((response: any) => response.data || []))
      }

      // Fetch notifications
      const notifRes = await fetch('/api/notifications')
      if (notifRes.ok) {
        const notifData = await notifRes.json()
        setNotifications(notifData)
      }
    } catch (error: any) {
      console.error('Error loading dashboard data:', error)
      toast.error(error?.message || 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthorized || !user) return
    loadData()
  }, [isAuthorized, user])

  // Calculate stats
  const totalChildren = children.length
  const todayAttendance = attendance.filter(a => a.date === new Date().toISOString().split('T')[0] && a.status === 'PRESENT').length
  // Calculate overall attendance percentage
  const totalAttendanceRecords = attendance.length
  const presentRecords = attendance.filter(a => a.status === 'PRESENT').length
  const attendancePercentage = totalAttendanceRecords > 0 
    ? Math.round((presentRecords / totalAttendanceRecords) * 100)
    : 0
  const averagePerformance = performance.length > 0
    ? Math.round(performance.reduce((sum, p) => sum + (p.score / p.maxScore) * 100, 0) / performance.length)
    : 0
  const unreadNotifications = notifications.filter((n: any) => !n.isRead).length

  const stats = {
    totalChildren,
    todayAttendance,
    attendancePercentage,
    averagePerformance,
    unreadNotifications,
  }

  const getChildAttendance = (childId: string) => {
    const childAttendance = attendance.filter(a => a.studentId === childId)
    if (childAttendance.length === 0) return 'N/A'
    const today = new Date().toISOString().split('T')[0]
    const todayRecord = childAttendance.find(a => a.date === today)
    return todayRecord ? todayRecord.status : 'N/A'
  }

  const getChildPerformance = (childId: string) => {
    const childPerformance = performance.filter(p => p.studentId === childId)
    if (childPerformance.length === 0) return 0
    return Math.round(childPerformance.reduce((sum, p) => sum + (p.score / p.maxScore) * 100, 0) / childPerformance.length)
  }

  // Create recent activity from fetched data
  const recentActivity = [
    ...attendance.slice(0, 3).map((a, index) => ({
      id: a.id || `attendance-${index}`,
      type: 'attendance',
      description: `${children.find(c => c.id === a.studentId)?.firstName || 'Student'} marked ${(a.status || 'present').toLowerCase()}`,
      time: new Date(a.date).toLocaleDateString(),
      child: children.find(c => c.id === a.studentId)?.firstName || 'Student',
    })),
    ...performance.slice(0, 2).map((p, index) => ({
      id: p.id || `performance-${index}`,
      type: 'performance',
      description: `${children.find(c => c.id === p.studentId)?.firstName || 'Student'} scored ${Math.round((p.score / p.maxScore) * 100)}% in ${p.subject}`,
      time: new Date(p.assessmentDate).toLocaleDateString(),
      child: children.find(c => c.id === p.studentId)?.firstName || 'Student',
    })),
  ].slice(0, 5)

  // Create upcoming events from notifications
  const upcomingEvents = notifications
    .filter(n => n.type === 'EVENT')
    .slice(0, 2)
    .map(n => ({
      id: n.id,
      title: n.title,
      date: new Date(n.createdAt).toISOString().split('T')[0],
      time: '9:00 AM',
      type: 'event',
    }))

  if (isLoading) {
    return (
      <DashboardLayout title="Parent Dashboard" subtitle="Monitor your children's progress and activities">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
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
    <DashboardLayout title="Parent Dashboard" subtitle="Monitor your children's progress and activities">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="My Children"
            value={stats.totalChildren}
            icon={Users}
            description="Children in school"
          />
          <StatCard
            title="Attendance"
            value={`${stats.attendancePercentage}%`}
            icon={CheckCircle}
            description="Overall attendance"
            trend={`${stats.todayAttendance} present today`}
          />
          <StatCard
            title="Average Performance"
            value={`${stats.averagePerformance}%`}
            icon={TrendingUp}
            description="Overall performance"
            trend="+3% improvement"
          />
          <StatCard
            title="Unread Notifications"
            value={stats.unreadNotifications}
            icon={Bell}
            description="Need your attention"
            trend="Check notifications"
          />
        </div>

        {/* Children Overview */}
        <Card>
          <CardHeader>
            <CardTitle>My Children</CardTitle>
            <CardDescription>
              Overview of your children's current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {children.map((child) => (
                <div key={child.id} className="p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{child.firstName} {child.lastName}</h3>
                      <p className="text-sm text-gray-500">{child.className || 'No class assigned'}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{getChildAttendance(child.id)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Award className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{getChildPerformance(child.id)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest activities related to your children
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {activity.type === 'attendance' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {activity.type === 'performance' && <TrendingUp className="h-4 w-4 text-blue-500" />}
                    {activity.type === 'announcement' && <Bell className="h-4 w-4 text-orange-500" />}
                    {activity.type === 'result' && <Award className="h-4 w-4 text-purple-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{activity.description}</p>
                    <p className="text-sm text-gray-500">{activity.time} • {activity.child}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Results */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Results</CardTitle>
            <CardDescription>
              Latest exam results for your children
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.slice(0, 5).map((result: Result, index) => (
                <div key={result.id || `result-${index}`} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{children.find(c => c.id === result.studentId)?.firstName || 'Student'} {children.find(c => c.id === result.studentId)?.lastName || ''}</h4>
                      <p className="text-sm text-gray-500">{result.examType} - {result.term}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{result.percentage}%</div>
                      <Badge variant="outline" className="mt-1">Grade {result.grade}</Badge>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{result.totalMarks}/{result.maxTotalMarks} marks</span>
                      <span>{new Date(result.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))}
              {results.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No results available yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>
              School events and activities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium">{event.title}</h4>
                      <p className="text-sm text-gray-500">{event.date} at {event.time}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="capitalize">{event.type}</Badge>
                </div>
              ))}
            </div>
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
                <Users className="h-8 w-8 text-blue-500 mb-2" />
                <h3 className="font-medium">View Children</h3>
                <p className="text-sm text-gray-500">See detailed information</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <CheckCircle className="h-8 w-8 text-green-500 mb-2" />
                <h3 className="font-medium">Attendance</h3>
                <p className="text-sm text-gray-500">View attendance records</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <TrendingUp className="h-8 w-8 text-purple-500 mb-2" />
                <h3 className="font-medium">Performance</h3>
                <p className="text-sm text-gray-500">Check performance data</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <Award className="h-8 w-8 text-orange-500 mb-2" />
                <h3 className="font-medium">Results</h3>
                <p className="text-sm text-gray-500">View exam results</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Announcements Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Announcements</CardTitle>
            <CardDescription>
              Latest school announcements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Bell className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">Science Fair Next Week</span>
                  <Badge variant="outline">Academic</Badge>
                </div>
                <p className="text-sm text-gray-600">The annual science fair will be held next week. All students are encouraged to participate...</p>
                <p className="text-xs text-gray-500 mt-2">2 days ago</p>
              </div>
              <div className="p-3 border rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Bell className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Parent-Teacher Meeting</span>
                  <Badge variant="outline">Meeting</Badge>
                </div>
                <p className="text-sm text-gray-600">Scheduled parent-teacher meeting to discuss student progress...</p>
                <p className="text-xs text-gray-500 mt-2">5 days ago</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}