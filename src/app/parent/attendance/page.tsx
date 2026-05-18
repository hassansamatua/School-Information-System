'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout, PageHeader } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRequireAuth } from '@/hooks/use-auth'
import {
  Search,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  GraduationCap,
  AlertCircle,
  Download,
} from 'lucide-react'
import { toast } from 'sonner'

interface Student {
  id: string
  registrationNumber: string
  firstName: string
  lastName: string
  classId: string | null
  className: string | null
  parentId: string | null
}

interface AttendanceRecord {
  id: string
  studentId: string
  date: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  remarks?: string
  recordedAt: string
}

export default function AttendancePage() {
  const { user, isAuthorized } = useRequireAuth('PARENT')
  const [students, setStudents] = useState<Student[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7))

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

      // Fetch students
      const studentsRes = await fetch('/api/students')
      if (!studentsRes.ok) throw new Error('Failed to load students')
      const allStudents = await studentsRes.json()
      const parentChildren = allStudents.filter((s: any) => s.parentId === parentData.id)
      setStudents(parentChildren)

      // Fetch attendance for children
      if (parentChildren.length > 0) {
        const attendancePromises = parentChildren.map((child: Student) =>
          fetch(`/api/attendance?studentId=${child.id}`).then(res => res.json())
        )
        const attendanceResponses = await Promise.all(attendancePromises)
        const attendanceData = attendanceResponses.map((res: any) => res.data || []).flat()
        setAttendanceRecords(attendanceData)
      }
    } catch (error: any) {
      console.error('Error loading attendance data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthorized || !user) return
    loadData()
  }, [isAuthorized, user])

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const filteredAttendanceRecords = attendanceRecords.filter(record => {
    const matchesStudent = !selectedStudent || record.studentId === selectedStudent
    const matchesMonth = record.date ? record.date.startsWith(selectedMonth) : false
    return matchesStudent && matchesMonth
  })

  const getAttendanceStats = () => {
    const records = filteredAttendanceRecords
    const total = records.length
    const present = records.filter(r => r.status === 'PRESENT').length
    const absent = records.filter(r => r.status === 'ABSENT').length
    const late = records.filter(r => r.status === 'LATE').length
    const excused = records.filter(r => r.status === 'EXCUSED').length

    return { total, present, absent, late, excused }
  }

  const getMonthlyStats = (studentId: string) => {
    const studentRecords = attendanceRecords.filter(r => 
      r.studentId === studentId && r.date.startsWith(selectedMonth)
    )
    
    const total = studentRecords.length
    const present = studentRecords.filter(r => r.status === 'PRESENT').length
    const attendanceRate = total > 0 ? (present / total) * 100 : 0

    return { total, present, attendanceRate }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return <Badge variant="default" className="bg-green-100 text-green-800">Present</Badge>
      case 'ABSENT':
        return <Badge variant="destructive">Absent</Badge>
      case 'LATE':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Late</Badge>
      case 'EXCUSED':
        return <Badge variant="outline">Excused</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const handleExportAttendance = async () => {
    try {
      // Mock export functionality
      toast.success('Attendance report downloaded successfully')
    } catch (error) {
      toast.error('Failed to download attendance report')
    }
  }

  const stats = getAttendanceStats()

  if (!isAuthorized) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout title="Attendance Records" subtitle="View your children's attendance history">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Days</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">In selected period</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Present</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.present}</div>
              <p className="text-xs text-muted-foreground">{stats.total > 0 ? `${((stats.present / stats.total) * 100).toFixed(1)}%` : '0%'}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Absent</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
              <p className="text-xs text-muted-foreground">{stats.total > 0 ? `${((stats.absent / stats.total) * 100).toFixed(1)}%` : '0%'}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Late</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.late}</div>
              <p className="text-xs text-muted-foreground">{stats.total > 0 ? `${((stats.late / stats.total) * 100).toFixed(1)}%` : '0%'}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Excused</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.excused}</div>
              <p className="text-xs text-muted-foreground">{stats.total > 0 ? `${((stats.excused / stats.total) * 100).toFixed(1)}%` : '0%'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Select
              value={selectedStudent || '__ALL__'}
              onValueChange={(v) => setSelectedStudent(v === '__ALL__' ? '' : v)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select child" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All Children</SelectItem>
                {filteredStudents.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-[180px]"
            />
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search children..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
          </div>
          
          <Button onClick={handleExportAttendance}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Children Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredStudents.map((student) => {
            const studentStats = getMonthlyStats(student.id)
            
            return (
              <Card key={student.id}>
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{student.firstName} {student.lastName}</CardTitle>
                      <CardDescription>{student.className}</CardDescription>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{student.registrationNumber}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Attendance Summary */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Monthly Attendance</h4>
                        <p className="text-sm text-gray-500">{selectedMonth}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{studentStats.attendanceRate.toFixed(0)}%</div>
                        <p className="text-xs text-gray-500">{studentStats.present}/{studentStats.total} days</p>
                      </div>
                    </div>

                    {/* Attendance Progress */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Attendance Rate</span>
                        <span>{studentStats.attendanceRate.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${studentStats.attendanceRate >= 90 ? 'bg-green-500' : studentStats.attendanceRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${studentStats.attendanceRate}%` }}
                        />
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold text-green-600">
                          {attendanceRecords.filter(r => r.studentId === student.id && r.date.startsWith(selectedMonth) && r.status === 'PRESENT').length}
                        </div>
                        <p className="text-xs text-gray-500">Present</p>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-red-600">
                          {attendanceRecords.filter(r => r.studentId === student.id && r.date.startsWith(selectedMonth) && r.status === 'ABSENT').length}
                        </div>
                        <p className="text-xs text-gray-500">Absent</p>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-yellow-600">
                          {attendanceRecords.filter(r => r.studentId === student.id && r.date.startsWith(selectedMonth) && r.status === 'LATE').length}
                        </div>
                        <p className="text-xs text-gray-500">Late</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Attendance Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>
              Detailed attendance records for {selectedMonth}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Registration</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                    <TableHead>Recorded At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAttendanceRecords.map((record) => {
                    const student = students.find(s => s.id === record.studentId)
                    if (!student) return null
                    return (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="h-4 w-4 text-gray-400" />
                            <span>{student.firstName} {student.lastName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{student.registrationNumber}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.className || 'N/A'}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{new Date(record.date).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(record.status)}</TableCell>
                        <TableCell>
                          {record.remarks ? (
                            <span className="text-sm text-gray-600">{record.remarks}</span>
                          ) : (
                            <span className="text-sm text-gray-400">No remarks</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{new Date(record.recordedAt).toLocaleTimeString()}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Attendance Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>
              Monthly attendance trends for your children
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredStudents.map((student) => {
                const studentStats = getMonthlyStats(student.id)
                
                return (
                  <div key={student.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="h-5 w-5 text-blue-500" />
                      <div>
                        <h4 className="font-medium">{student.firstName} {student.lastName}</h4>
                        <p className="text-sm text-gray-500">{student.className}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">{studentStats.attendanceRate.toFixed(0)}%</div>
                        <p className="text-sm text-gray-500">{studentStats.present}/{studentStats.total} days</p>
                      </div>
                      <div className="w-32">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${studentStats.attendanceRate >= 90 ? 'bg-green-500' : studentStats.attendanceRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${studentStats.attendanceRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}