'use client'

import React, { useEffect, useState } from 'react'
import { DashboardLayout, PageHeader } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useRequireAuth } from '@/hooks/use-auth'
import {
  BookOpen,
  Users,
  GraduationCap,
  Search,
  Calendar,
  Target,
  RefreshCw,
} from 'lucide-react'

interface TeacherClass {
  id: string
  name: string
  form: number | null
  stream: string | null
  maxStudents: number | null
  teacherId: string | null
  currentStudents?: number
  createdAt: string | null
  updatedAt: string | null
}

export default function TeacherClassesPage() {
  const { user, isAuthorized } = useRequireAuth('TEACHER')
  const [classes, setClasses] = useState<TeacherClass[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

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
        setClasses([])
        setIsLoading(false)
        return
      }

      // Fetch classes for this teacher
      const classesRes = await fetch('/api/classes')
      if (!classesRes.ok) throw new Error('Failed to load classes')
      const allClasses = await classesRes.json()
      const teacherClasses = allClasses.filter((c: any) => c.teacherId === teacherData.id)
      setClasses(teacherClasses)
    } catch (error: any) {
      console.error('Error loading classes data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthorized || !user) return
    loadData()
  }, [isAuthorized, user])

  if (!isAuthorized) {
    return <div className="p-6">Loading...</div>
  }

  const filtered = classes.filter((c) => {
    const q = searchQuery.toLowerCase()
    return (
      c.name.toLowerCase().includes(q) ||
      (c.stream || '').toLowerCase().includes(q)
    )
  })

  const totalStudents = classes.reduce((sum, c) => sum + (c.currentStudents || 0), 0)
  const totalCapacity = classes.reduce((sum, c) => sum + (c.maxStudents || 0), 0)
  const occupancyRate = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="My Classes"
          description="Classes you are assigned to teach"
        />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{classes.length}</div>
              <p className="text-xs text-muted-foreground">Active assignments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs text-muted-foreground">Across all classes</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Capacity</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCapacity}</div>
              <p className="text-xs text-muted-foreground">Max students</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Occupancy</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{occupancyRate}%</div>
              <p className="text-xs text-muted-foreground">Filled seats</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Class List</CardTitle>
            <CardDescription>All classes assigned to you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search classes..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Loading classes...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                No classes found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Class</TableHead>
                    <TableHead>Form</TableHead>
                    <TableHead>Stream</TableHead>
                    <TableHead>Max Students</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.form || '—'}</TableCell>
                      <TableCell>{c.stream || '—'}</TableCell>
                      <TableCell>{c.maxStudents || '—'}</TableCell>
                      <TableCell>
                        <Badge variant="default">Active</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
