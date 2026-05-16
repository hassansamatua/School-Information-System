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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRequireAuth } from '@/hooks/use-auth'
import {
  Search,
  Eye,
  GraduationCap,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  BookOpen,
  Award,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'

interface Student {
  id: string
  registrationNumber: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE'
  address?: string
  phone?: string
  email?: string
  classId: string
  className: string
  isActive: boolean
  enrollmentDate: string
  photo?: string
}

interface AttendanceRecord {
  id: string
  date: string
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  remarks?: string
}

interface PerformanceRecord {
  id: string
  subject: string
  assessmentType: string
  score: number
  maxScore: number
  grade: string
  percentage: number
  assessmentDate: string
  remarks?: string
}

interface Result {
  id: string
  examType: string
  term: string
  academicYear: string
  totalMarks: number
  maxTotalMarks: number
  percentage: number
  grade: string
  rank?: number
  publishedAt: string
}

export default function StudentsPage() {
  const { user, isAuthorized } = useRequireAuth('PARENT')
  const [students, setStudents] = useState<Student[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockStudents: Student[] = [
      {
        id: '1',
        registrationNumber: 'REG2024001',
        firstName: 'Alice',
        lastName: 'Johnson',
        dateOfBirth: '2010-05-15',
        gender: 'FEMALE',
        address: '123 Main St, City',
        phone: '+1234567890',
        email: 'alice.johnson@email.com',
        classId: '1',
        className: 'Grade 5-A',
        isActive: true,
        enrollmentDate: '2024-01-15',
      },
      {
        id: '2',
        registrationNumber: 'REG2024002',
        firstName: 'Bob',
        lastName: 'Johnson',
        dateOfBirth: '2011-08-20',
        gender: 'MALE',
        address: '123 Main St, City',
        phone: '+1234567891',
        email: 'bob.johnson@email.com',
        classId: '2',
        className: 'Grade 4-B',
        isActive: true,
        enrollmentDate: '2024-01-20',
      },
    ]

    setTimeout(() => {
      setStudents(mockStudents)
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredStudents = students.filter(student =>
    student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.className.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openDetailsDialog = (student: Student) => {
    setSelectedStudent(student)
    setIsDetailsDialogOpen(true)
  }

  const getAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    const age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1
    }
    return age
  }

  const getStudentStats = (studentId: string) => {
    // Mock data for student stats
    const attendanceRecords: AttendanceRecord[] = [
      { id: '1', date: '2024-03-15', status: 'PRESENT' },
      { id: '2', date: '2024-03-14', status: 'PRESENT' },
      { id: '3', date: '2024-03-13', status: 'LATE', remarks: 'Traffic delay' },
      { id: '4', date: '2024-03-12', status: 'PRESENT' },
      { id: '5', date: '2024-03-11', status: 'PRESENT' },
    ]

    const performanceRecords: PerformanceRecord[] = [
      { id: '1', subject: 'Mathematics', assessmentType: 'Test', score: 85, maxScore: 100, grade: 'B', percentage: 85, assessmentDate: '2024-03-10' },
      { id: '2', subject: 'Science', assessmentType: 'Quiz', score: 92, maxScore: 100, grade: 'A', percentage: 92, assessmentDate: '2024-03-08' },
      { id: '3', subject: 'English', assessmentType: 'Assignment', score: 88, maxScore: 100, grade: 'B', percentage: 88, assessmentDate: '2024-03-05' },
    ]

    const results: Result[] = [
      { id: '1', examType: 'Midterm', term: 'Term 2', academicYear: '2023-2024', totalMarks: 450, maxTotalMarks: 500, percentage: 90, grade: 'A', rank: 5, publishedAt: '2024-03-10' },
    ]

    const totalAttendance = attendanceRecords.length
    const presentDays = attendanceRecords.filter(r => r.status === 'PRESENT').length
    const attendanceRate = totalAttendance > 0 ? (presentDays / totalAttendance) * 100 : 0

    const averageScore = performanceRecords.length > 0 
      ? performanceRecords.reduce((sum, r) => sum + r.percentage, 0) / performanceRecords.length 
      : 0

    return {
      attendanceRate,
      averageScore,
      totalAttendance,
      presentDays,
      performanceRecords,
      results,
    }
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

  if (!isAuthorized) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout title="My Children" subtitle="View detailed information about your children">
      <div className="space-y-6">
        {/* Search Bar */}
        <div className="flex items-center space-x-2">
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

        {/* Students Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {filteredStudents.map((student) => {
            const stats = getStudentStats(student.id)
            
            return (
              <Card key={student.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                      <GraduationCap className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{student.firstName} {student.lastName}</CardTitle>
                      <CardDescription>{student.className}</CardDescription>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{student.registrationNumber}</Badge>
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{stats.attendanceRate.toFixed(0)}%</div>
                        <p className="text-xs text-gray-500">Attendance</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{stats.averageScore.toFixed(0)}%</div>
                        <p className="text-xs text-gray-500">Avg Score</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{getAge(student.dateOfBirth)}</div>
                        <p className="text-xs text-gray-500">Age</p>
                      </div>
                    </div>

                    {/* Recent Performance */}
                    <div>
                      <h4 className="font-medium mb-2">Recent Performance</h4>
                      <div className="space-y-2">
                        {stats.performanceRecords.slice(0, 3).map((record) => (
                          <div key={record.id} className="flex items-center justify-between text-sm">
                            <span>{record.subject}</span>
                            <div className="flex items-center space-x-2">
                              <span>{record.percentage}%</span>
                              <Badge variant="outline" className="text-xs">{record.grade}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Phone className="h-4 w-4" />
                        <span>{student.phone}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDetailsDialog(student)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Children ({filteredStudents.length})</CardTitle>
            <CardDescription>
              Complete list of your children in the school system
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
                    <TableHead>Age</TableHead>
                    <TableHead>Attendance</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => {
                    const stats = getStudentStats(student.id)
                    
                    return (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <GraduationCap className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{student.firstName} {student.lastName}</div>
                              <div className="text-sm text-gray-500 flex items-center">
                                <Mail className="h-3 w-3 mr-1" />
                                {student.email || 'No email'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{student.registrationNumber}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.className}</Badge>
                        </TableCell>
                        <TableCell>{getAge(student.dateOfBirth)} years</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${stats.attendanceRate >= 90 ? 'bg-green-500' : stats.attendanceRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ width: `${stats.attendanceRate}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium">{stats.attendanceRate.toFixed(0)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="h-4 w-4 text-gray-400" />
                            <span>{stats.averageScore.toFixed(1)}%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openDetailsDialog(student)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
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

        {/* Student Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Student Details</DialogTitle>
              <DialogDescription>
                Complete information about {selectedStudent?.firstName} {selectedStudent?.lastName}
              </DialogDescription>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Basic Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Full Name:</span>
                        <span className="text-sm">{selectedStudent.firstName} {selectedStudent.lastName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Registration:</span>
                        <span className="text-sm">{selectedStudent.registrationNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Date of Birth:</span>
                        <span className="text-sm">{new Date(selectedStudent.dateOfBirth).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Age:</span>
                        <span className="text-sm">{getAge(selectedStudent.dateOfBirth)} years</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Gender:</span>
                        <span className="text-sm capitalize">{selectedStudent.gender.toLowerCase()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Class:</span>
                        <span className="text-sm">{selectedStudent.className}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Email:</span>
                        <span className="text-sm">{selectedStudent.email || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Phone:</span>
                        <span className="text-sm">{selectedStudent.phone || 'Not provided'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Address:</span>
                        <span className="text-sm">{selectedStudent.address || 'Not provided'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Performance Summary */}
                <div>
                  <h4 className="font-medium mb-2">Performance Summary</h4>
                  {(() => {
                    const stats = getStudentStats(selectedStudent.id)
                    return (
                      <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.attendanceRate.toFixed(0)}%</div>
                      <p className="text-sm text-gray-500">Attendance Rate</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.averageScore.toFixed(1)}%</div>
                      <p className="text-sm text-gray-500">Average Score</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.presentDays}/{stats.totalAttendance}</div>
                      <p className="text-sm text-gray-500">Days Present</p>
                    </div>
                  </div>
                )
                  })()}
                </div>

                {/* Recent Results */}
                <div>
                  <h4 className="font-medium mb-2">Recent Results</h4>
                  {(() => {
                    const stats = getStudentStats(selectedStudent.id)
                    return (
                      <div className="space-y-2">
                        {stats.results.map((result) => (
                          <div key={result.id} className="p-3 border rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <h5 className="font-medium">{result.examType} - {result.term}</h5>
                                <p className="text-sm text-gray-500">{result.academicYear}</p>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-green-600">{result.percentage}%</div>
                                <Badge variant="outline" className="mt-1">Grade {result.grade}</Badge>
                                {result.rank && <p className="text-sm text-gray-500">Rank: #{result.rank}</p>}
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
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}