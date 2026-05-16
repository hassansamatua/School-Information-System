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
  TrendingUp,
  Calendar,
  Bell,
  AlertCircle,
  BookOpen,
  Clock,
  Award,
} from 'lucide-react'

export default function ParentDashboard() {
  const { user, isAuthorized } = useRequireAuth('PARENT')

  if (!isAuthorized) {
    return <div>Loading...</div>
  }

  // Mock data - in real app, this would come from API
  const stats = {
    totalChildren: 2,
    todayAttendance: 2,
    averagePerformance: 88.5,
    unreadNotifications: 3,
    upcomingEvents: 2,
    recentResults: 1,
    pendingAnnouncements: 4,
  }

  const children = [
    {
      id: '1',
      name: 'Alice Johnson',
      class: 'Grade 5-A',
      attendance: 'Present',
      performance: 92,
      photo: '/api/placeholder/40/40',
    },
    {
      id: '2',
      name: 'Bob Johnson',
      class: 'Grade 3-B',
      attendance: 'Present',
      performance: 85,
      photo: '/api/placeholder/40/40',
    },
  ]

  const recentActivity = [
    { id: 1, type: 'attendance', description: 'Alice marked present today', time: '2 hours ago', child: 'Alice' },
    { id: 2, type: 'performance', description: 'Bob scored 85% in Math test', time: '1 day ago', child: 'Bob' },
    { id: 3, type: 'announcement', description: 'Science Fair next week', time: '2 days ago', child: 'All' },
    { id: 4, type: 'result', description: 'Alice midterm results published', time: '3 days ago', child: 'Alice' },
  ]

  const upcomingEvents = [
    { id: 1, title: 'Science Fair', date: '2024-03-25', time: '9:00 AM', type: 'academic' },
    { id: 2, title: 'Parent-Teacher Meeting', date: '2024-03-28', time: '2:00 PM', type: 'meeting' },
  ]

  const recentResults = [
    {
      id: '1',
      studentName: 'Alice Johnson',
      examType: 'Midterm',
      term: 'Term 2',
      totalMarks: 450,
      maxTotalMarks: 500,
      percentage: 90,
      grade: 'A',
      date: '2024-03-10',
    },
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
            title="Today's Attendance"
            value={stats.todayAttendance}
            icon={CheckCircle}
            description="Present today"
            trend="100% attendance"
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
                      <h3 className="font-semibold">{child.name}</h3>
                      <p className="text-sm text-gray-500">{child.class}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{child.attendance}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Award className="h-4 w-4 text-blue-500" />
                          <span className="text-sm">{child.performance}%</span>
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
              {recentResults.map((result) => (
                <div key={result.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">{result.studentName}</h4>
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
                      <span>{new Date(result.date).toLocaleDateString()}</span>
                    </div>
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