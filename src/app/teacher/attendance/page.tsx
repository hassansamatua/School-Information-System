'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout, PageHeader } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useRequireAuth } from '@/hooks/use-auth'
import {
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Users,
  GraduationCap,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'

interface Student {
  id: string
  registrationNumber: string
  firstName: string
  lastName: string
  classId: string | null
  className: string | null
}

interface AttendanceRecord {
  id: string
  studentId: string
  classId: string
  date: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  remarks: string | null
  createdAt: string
}

interface Class {
  id: string
  name: string
  form: number | null
  stream: string | null
  teacherId: string | null
}

export default function AttendancePage() {
  const { user, isAuthorized } = useRequireAuth('TEACHER')
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [isMarkAttendanceDialogOpen, setIsMarkAttendanceDialogOpen] = useState(false)
  const [attendanceData, setAttendanceData] = useState<Record<string, { status: string; remarks: string }>>({})

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
        setStudents([])
        setAttendanceRecords([])
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
      setStudents(teacherStudents)

      // Fetch attendance records for teacher's classes
      const attendancePromises = teacherClasses.map((c: any) =>
        fetch(`/api/attendance?classId=${c.id}`).then(res => res.json())
      )
      const attendanceResponses = await Promise.all(attendancePromises)
      const attendanceData = attendanceResponses.map((res: any) => res.data || []).flat()
      setAttendanceRecords(attendanceData)
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
    const matchesClass = !selectedClass || student.classId === selectedClass
    const matchesSearch = student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesClass && matchesSearch
  })

  const filteredAttendanceRecords = attendanceRecords.filter(record => {
    const matchesClass = !selectedClass || record.classId === selectedClass
    const matchesDate = record.date === selectedDate
    return matchesClass && matchesDate
  })

  const handleMarkAttendance = async () => {
    try {
      if (!selectedClass || !selectedDate) {
        toast.error('Please select a class and date')
        return
      }

      const records = filteredStudents.map((student) => {
        const data = attendanceData[student.id] || { status: 'PRESENT', remarks: '' }
        return {
          studentId: student.id,
          classId: student.classId,
          date: selectedDate,
          status: data.status,
          remarks: data.remarks || undefined,
        }
      })

      const className = classes.find((c) => c.id === selectedClass)?.name || 'class'

      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'ATTENDANCE',
          title: `Attendance - ${className} - ${selectedDate}`,
          content: `Attendance for ${records.length} student(s) on ${selectedDate}`,
          targetAudience: 'SPECIFIC_CLASS',
          targetId: selectedClass,
          data: { records },
          submitNow: true,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Failed (${res.status})`)
      }

      // Optimistic local UI update so the teacher sees the entries.
      const newRecords: AttendanceRecord[] = filteredStudents.map((student, index) => {
        const data = attendanceData[student.id] || { status: 'PRESENT', remarks: '' }
        return {
          id: Date.now().toString() + index,
          studentId: student.id,
          classId: student.classId || '',
          date: selectedDate,
          status: data.status as 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED',
          remarks: data.remarks || null,
          createdAt: new Date().toISOString(),
        }
      })
      setAttendanceRecords((prev) => {
        const filtered = prev.filter((r) => !(r.date === selectedDate && r.classId === selectedClass))
        return [...filtered, ...newRecords]
      })

      setIsMarkAttendanceDialogOpen(false)
      setAttendanceData({})
      toast.success('Attendance submitted for approval')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit attendance')
    }
  }

  const handleAttendanceChange = (studentId: string, status: string, remarks: string) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: { status, remarks }
    }))
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

  const getAttendanceStats = () => {
    const total = filteredAttendanceRecords.length
    const present = filteredAttendanceRecords.filter(r => r.status === 'PRESENT').length
    const absent = filteredAttendanceRecords.filter(r => r.status === 'ABSENT').length
    const late = filteredAttendanceRecords.filter(r => r.status === 'LATE').length
    const excused = filteredAttendanceRecords.filter(r => r.status === 'EXCUSED').length

    return { total, present, absent, late, excused }
  }

  const stats = getAttendanceStats()

  if (!isAuthorized) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout title="Attendance Management" subtitle="Mark and view student attendance">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">In selected class</p>
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
              value={selectedClass || '__ALL__'}
              onValueChange={(v) => setSelectedClass(v === '__ALL__' ? '' : v)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All Classes</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-[180px]"
            />
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
          </div>
          
          <Dialog open={isMarkAttendanceDialogOpen} onOpenChange={setIsMarkAttendanceDialogOpen}>
            <DialogTrigger asChild>
              <Button disabled={!selectedClass || !selectedDate}>
                <Plus className="mr-2 h-4 w-4" />
                Mark Attendance
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[800px]">
              <DialogHeader>
                <DialogTitle>Mark Attendance</DialogTitle>
                <DialogDescription>
                  Mark attendance for {classes.find(c => c.id === selectedClass)?.name} on {selectedDate}
                </DialogDescription>
              </DialogHeader>
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Registration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="h-4 w-4 text-gray-400" />
                            <span>{student.firstName} {student.lastName}</span>
                          </div>
                        </TableCell>
                        <TableCell>{student.registrationNumber}</TableCell>
                        <TableCell>
                          <Select
                            value={attendanceData[student.id]?.status || 'PRESENT'}
                            onValueChange={(value) => 
                              handleAttendanceChange(student.id, value, attendanceData[student.id]?.remarks || '')
                            }
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PRESENT">Present</SelectItem>
                              <SelectItem value="ABSENT">Absent</SelectItem>
                              <SelectItem value="LATE">Late</SelectItem>
                              <SelectItem value="EXCUSED">Excused</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Add remarks..."
                            value={attendanceData[student.id]?.remarks || ''}
                            onChange={(e) => 
                              handleAttendanceChange(student.id, attendanceData[student.id]?.status || 'PRESENT', e.target.value)
                            }
                            className="w-[200px]"
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsMarkAttendanceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleMarkAttendance}>Save Attendance</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Attendance Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Records</CardTitle>
            <CardDescription>
              View attendance records for {selectedDate}
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
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{new Date(record.createdAt).toLocaleTimeString()}</span>
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
      </div>
    </DashboardLayout>
  )
}