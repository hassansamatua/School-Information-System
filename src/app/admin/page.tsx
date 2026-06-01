'use client'

import React, { useEffect, useState } from 'react'
import { DashboardLayout, PageHeader } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRequireAuth } from '@/hooks/use-auth'
import {
  Users,
  GraduationCap,
  UserCheck,
  BookOpen,
  CheckCircle,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react'

interface DashboardStats {
  totalStudents: number
  totalTeachers: number
  totalParents: number
  totalClasses: number
  pendingApprovals: number
  todayAttendance: number
  attendanceRate: string
  averagePerformance: string
  recentActivity: Array<{
    id: string
    type: string
    description: string
    time: string
  }>
}

export default function AdminDashboard() {
  const { user, isAuthorized } = useRequireAuth('ADMIN')
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/dashboard/stats')
        if (res.ok) {
          const data = await res.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard stats:', error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthorized) {
      fetchStats()
    }
  }, [isAuthorized])

  if (!isAuthorized) {
    return <div>Loading...</div>
  }

  if (loading || !stats) {
    return <div>Loading dashboard...</div>
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
    <DashboardLayout title="Admin Dashboard" subtitle="Manage your school system">
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={GraduationCap}
            description="Active students"
          />
          <StatCard
            title="Total Teachers"
            value={stats.totalTeachers}
            icon={Users}
            description="Active teachers"
          />
          <StatCard
            title="Total Parents"
            value={stats.totalParents}
            icon={UserCheck}
            description="Registered parents"
          />
          <StatCard
            title="Total Classes"
            value={stats.totalClasses}
            icon={BookOpen}
            description="Active classes"
          />
        </div>

        {/* Additional Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={Clock}
            description="Waiting for review"
          />
          <StatCard
            title="Today's Attendance"
            value={stats.todayAttendance}
            icon={CheckCircle}
            description={`${stats.totalStudents > 0 ? ((stats.todayAttendance / stats.totalStudents) * 100).toFixed(1) : '0'}% attendance rate`}
          />
          <StatCard
            title="Average Performance"
            value={`${stats.averagePerformance}%`}
            icon={TrendingUp}
            description="Overall student performance"
          />
          <StatCard
            title="System Health"
            value="Good"
            icon={AlertCircle}
            description="All systems operational"
          />
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest activities in the school system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {activity.type === 'teacher' && <Users className="h-4 w-4 text-blue-500" />}
                    {activity.type === 'parent' && <UserCheck className="h-4 w-4 text-green-500" />}
                    {activity.type === 'announcement' && <AlertCircle className="h-4 w-4 text-orange-500" />}
                    {activity.type === 'student' && <GraduationCap className="h-4 w-4 text-purple-500" />}
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

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common administrative tasks
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <Users className="h-8 w-8 text-blue-500 mb-2" />
                <h3 className="font-medium">Add Teacher</h3>
                <p className="text-sm text-gray-500">Create new teacher account</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <GraduationCap className="h-8 w-8 text-green-500 mb-2" />
                <h3 className="font-medium">Add Student</h3>
                <p className="text-sm text-gray-500">Register new student</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <BookOpen className="h-8 w-8 text-purple-500 mb-2" />
                <h3 className="font-medium">Create Class</h3>
                <p className="text-sm text-gray-500">Set up new class</p>
              </div>
              <div className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <CheckCircle className="h-8 w-8 text-orange-500 mb-2" />
                <h3 className="font-medium">Review Approvals</h3>
                <p className="text-sm text-gray-500">Check pending items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}