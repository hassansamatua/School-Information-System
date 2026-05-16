'use client'

import React from 'react'
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

  if (!isAuthorized) {
    return <div>Loading...</div>
  }

  // Mock data - in real app, this would come from API
  const stats = {
    totalStudents: 85,
    totalClasses: 3,
    pendingApprovals: 2,
    todayAttendance: 78,
    averagePerformance: 82.5,
    recentSubmissions: 5,
    upcomingEvents: 3,
    unreadNotifications: 4,
  }

  const recentActivity = [
    { id: 1, type: 'attendance', description: 'Recorded attendance for Grade 5-A', time: '2 hours ago' },
    { id: 2, type: 'performance', description: 'Added performance scores for Math test', time: '3 hours ago' },
    { id: 3, type: 'submission', description: 'Submitted announcement: Science Fair', time: '5 hours ago' },
    { id: 4, type: 'attendance', description: 'Recorded attendance for Grade 6-B', time: '1 day ago' },
    { id: 5, type: 'performance', description: 'Updated performance records', time: '2 days ago' },
  ]

  const upcomingEvents = [
    { id: 1, title: 'Staff Meeting', date: '2024-03-18', time: '10:00 AM' },
    { id: 2, title: 'Parent-Teacher Conference', date: '2024-03-20', time: '2:00 PM' },
    { id: 3, title: 'Science Fair', date: '2024-03-25', time: '9:00 AM' },
  ]

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
            trend="+5 new this month"
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
            trend="Requires attention"
          />
          <StatCard
            title="Today's Attendance"
            value={stats.todayAttendance}
            icon={CheckCircle}
            description={`${((stats.todayAttendance / stats.totalStudents) * 100).toFixed(1)}% attendance rate`}
            trend="Good attendance"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Average Performance"
            value={`${stats.averagePerformance}%`}
            icon={TrendingUp}
            description="Overall student performance"
            trend="+2% improvement"
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
            trend="Check notifications"
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
                  <Badge variant="outline">Upcoming</Badge>
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
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-5 w-5 text-blue-500" />
                    <div>
                      <h4 className="font-medium">Grade 5-A</h4>
                      <p className="text-sm text-gray-500">25 students</p>
                    </div>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">Grade 6-B</h4>
                      <p className="text-sm text-gray-500">30 students</p>
                    </div>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <BookOpen className="h-5 w-5 text-purple-500" />
                    <div>
                      <h4 className="font-medium">Grade 4-C</h4>
                      <p className="text-sm text-gray-500">30 students</p>
                    </div>
                  </div>
                  <Badge variant="outline">Active</Badge>
                </div>
              </div>
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
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-yellow-500" />
                    <div>
                      <h4 className="font-medium">Science Fair</h4>
                      <p className="text-sm text-gray-500">Event announcement</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">Math Test Results</h4>
                      <p className="text-sm text-gray-500">Performance records</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <h4 className="font-medium">Daily Attendance</h4>
                      <p className="text-sm text-gray-500">Attendance records</p>
                    </div>
                  </div>
                  <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}