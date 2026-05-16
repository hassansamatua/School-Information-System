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
  TrendingUp,
  Calendar,
  Award,
  BookOpen,
  Target,
  GraduationCap,
  Download,
  BarChart3,
} from 'lucide-react'
import { toast } from 'sonner'

interface Student {
  id: string
  registrationNumber: string
  firstName: string
  lastName: string
  classId: string
  className: string
}

interface PerformanceRecord {
  id: string
  studentId: string
  studentName: string
  registrationNumber: string
  classId: string
  className: string
  subject: string
  assessmentType: 'QUIZ' | 'TEST' | 'ASSIGNMENT' | 'PROJECT' | 'EXAM'
  score: number
  maxScore: number
  grade?: string
  remarks?: string
  assessmentDate: string
  recordedAt: string
}

interface Result {
  id: string
  studentId: string
  studentName: string
  examType: 'MIDTERM' | 'FINAL' | 'UNIT_TEST' | 'PRACTICAL'
  term: string
  academicYear: string
  subjects: any[]
  totalMarks: number
  maxTotalMarks: number
  percentage: number
  grade: string
  rank?: number
  remarks?: string
  publishedAt: string
}

export default function PerformancePage() {
  const { user, isAuthorized } = useRequireAuth('PARENT')
  const [students, setStudents] = useState<Student[]>([])
  const [performanceRecords, setPerformanceRecords] = useState<PerformanceRecord[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [selectedAssessmentType, setSelectedAssessmentType] = useState<string>('')

  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Art', 'Music', 'Physical Education']

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockStudents: Student[] = [
      { id: '1', registrationNumber: 'REG2024001', firstName: 'Alice', lastName: 'Johnson', classId: '1', className: 'Grade 5-A' },
      { id: '2', registrationNumber: 'REG2024002', firstName: 'Bob', lastName: 'Johnson', classId: '2', className: 'Grade 4-B' },
    ]

    const mockPerformanceRecords: PerformanceRecord[] = [
      {
        id: '1',
        studentId: '1',
        studentName: 'Alice Johnson',
        registrationNumber: 'REG2024001',
        classId: '1',
        className: 'Grade 5-A',
        subject: 'Mathematics',
        assessmentType: 'TEST',
        score: 85,
        maxScore: 100,
        grade: 'B',
        remarks: 'Good performance',
        assessmentDate: '2024-03-10',
        recordedAt: '2024-03-10T15:30:00Z',
      },
      {
        id: '2',
        studentId: '1',
        studentName: 'Alice Johnson',
        registrationNumber: 'REG2024001',
        classId: '1',
        className: 'Grade 5-A',
        subject: 'Science',
        assessmentType: 'QUIZ',
        score: 92,
        maxScore: 100,
        grade: 'A',
        remarks: 'Excellent work',
        assessmentDate: '2024-03-08',
        recordedAt: '2024-03-08T14:20:00Z',
      },
      {
        id: '3',
        studentId: '1',
        studentName: 'Alice Johnson',
        registrationNumber: 'REG2024001',
        classId: '1',
        className: 'Grade 5-A',
        subject: 'English',
        assessmentType: 'ASSIGNMENT',
        score: 88,
        maxScore: 100,
        grade: 'B',
        remarks: 'Well written',
        assessmentDate: '2024-03-05',
        recordedAt: '2024-03-05T16:45:00Z',
      },
      {
        id: '4',
        studentId: '2',
        studentName: 'Bob Johnson',
        registrationNumber: 'REG2024002',
        classId: '2',
        className: 'Grade 4-B',
        subject: 'Mathematics',
        assessmentType: 'TEST',
        score: 78,
        maxScore: 100,
        grade: 'C',
        remarks: 'Needs improvement',
        assessmentDate: '2024-03-12',
        recordedAt: '2024-03-12T10:15:00Z',
      },
      {
        id: '5',
        studentId: '2',
        studentName: 'Bob Johnson',
        registrationNumber: 'REG2024002',
        classId: '2',
        className: 'Grade 4-B',
        subject: 'Science',
        assessmentType: 'QUIZ',
        score: 85,
        maxScore: 100,
        grade: 'B',
        remarks: 'Good understanding',
        assessmentDate: '2024-03-09',
        recordedAt: '2024-03-09T11:30:00Z',
      },
    ]

    const mockResults: Result[] = [
      {
        id: '1',
        studentId: '1',
        studentName: 'Alice Johnson',
        examType: 'MIDTERM',
        term: 'Term 2',
        academicYear: '2023-2024',
        subjects: [
          { subject: 'Mathematics', marks: 85, maxMarks: 100, grade: 'B' },
          { subject: 'Science', marks: 92, maxMarks: 100, grade: 'A' },
          { subject: 'English', marks: 88, maxMarks: 100, grade: 'B' },
          { subject: 'History', marks: 90, maxMarks: 100, grade: 'A' },
        ],
        totalMarks: 355,
        maxTotalMarks: 400,
        percentage: 88.75,
        grade: 'B',
        rank: 5,
        remarks: 'Good overall performance',
        publishedAt: '2024-03-10T09:00:00Z',
      },
      {
        id: '2',
        studentId: '2',
        studentName: 'Bob Johnson',
        examType: 'MIDTERM',
        term: 'Term 2',
        academicYear: '2023-2024',
        subjects: [
          { subject: 'Mathematics', marks: 78, maxMarks: 100, grade: 'C' },
          { subject: 'Science', marks: 85, maxMarks: 100, grade: 'B' },
          { subject: 'English', marks: 82, maxMarks: 100, grade: 'B' },
          { subject: 'History', marks: 80, maxMarks: 100, grade: 'B' },
        ],
        totalMarks: 325,
        maxTotalMarks: 400,
        percentage: 81.25,
        grade: 'B',
        rank: 12,
        remarks: 'Needs more practice',
        publishedAt: '2024-03-10T09:00:00Z',
      },
    ]

    setTimeout(() => {
      setStudents(mockStudents)
      setPerformanceRecords(mockPerformanceRecords)
      setResults(mockResults)
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  const filteredPerformanceRecords = performanceRecords.filter(record => {
    const matchesStudent = !selectedStudent || record.studentId === selectedStudent
    const matchesSubject = !selectedSubject || record.subject === selectedSubject
    const matchesType = !selectedAssessmentType || record.assessmentType === selectedAssessmentType
    return matchesStudent && matchesSubject && matchesType
  })

  const filteredResults = results.filter(result => {
    const matchesStudent = !selectedStudent || result.studentId === selectedStudent
    return matchesStudent
  })

  const getPerformanceStats = () => {
    const records = filteredPerformanceRecords
    const total = records.length
    const averageScore = total > 0 ? records.reduce((sum, r) => sum + (r.score / r.maxScore) * 100, 0) / total : 0

    const gradeDistribution = {
      A: records.filter(r => r.grade === 'A').length,
      B: records.filter(r => r.grade === 'B').length,
      C: records.filter(r => r.grade === 'C').length,
      D: records.filter(r => r.grade === 'D').length,
      F: records.filter(r => r.grade === 'F').length,
    }

    return { total, averageScore, gradeDistribution }
  }

  const getStudentPerformanceStats = (studentId: string) => {
    const studentRecords = performanceRecords.filter(r => r.studentId === studentId)
    const total = studentRecords.length
    const averageScore = total > 0 ? studentRecords.reduce((sum, r) => sum + (r.score / r.maxScore) * 100, 0) / total : 0

    return { total, averageScore }
  }

  const getAssessmentTypeBadge = (type: string) => {
    const colors = {
      QUIZ: 'bg-blue-100 text-blue-800',
      TEST: 'bg-green-100 text-green-800',
      ASSIGNMENT: 'bg-purple-100 text-purple-800',
      PROJECT: 'bg-orange-100 text-orange-800',
      EXAM: 'bg-red-100 text-red-800',
    }
    return <Badge variant="outline" className={colors[type as keyof typeof colors]}>{type}</Badge>
  }

  const getGradeColor = (grade: string) => {
    const colors = {
      'A': 'text-green-600',
      'B': 'text-blue-600',
      'C': 'text-yellow-600',
      'D': 'text-orange-600',
      'F': 'text-red-600',
    }
    return colors[grade as keyof typeof colors] || 'text-gray-600'
  }

  const handleExportPerformance = async () => {
    try {
      // Mock export functionality
      toast.success('Performance report downloaded successfully')
    } catch (error) {
      toast.error('Failed to download performance report')
    }
  }

  const stats = getPerformanceStats()

  if (!isAuthorized) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout title="Performance Records" subtitle="View your children's academic performance">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Performance records</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averageScore.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Overall performance</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Top Performers</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.gradeDistribution.A}</div>
              <p className="text-xs text-muted-foreground">Grade A records</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Need Help</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.gradeDistribution.F + stats.gradeDistribution.D}</div>
              <p className="text-xs text-muted-foreground">Below average</p>
            </CardContent>
          </Card>
        </div>

        {/* Grade Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>
              Overview of performance grades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4">
              {Object.entries(stats.gradeDistribution).map(([grade, count]) => (
                <div key={grade} className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <Badge variant="outline" className={`mt-1 ${getGradeColor(grade)}`}>
                    Grade {grade}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters and Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select child" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Children</SelectItem>
                {filteredStudents.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.firstName} {student.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedAssessmentType} onValueChange={setSelectedAssessmentType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                <SelectItem value="QUIZ">Quiz</SelectItem>
                <SelectItem value="TEST">Test</SelectItem>
                <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                <SelectItem value="PROJECT">Project</SelectItem>
                <SelectItem value="EXAM">Exam</SelectItem>
              </SelectContent>
            </Select>
            
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
          
          <Button onClick={handleExportPerformance}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        {/* Children Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredStudents.map((student) => {
            const studentStats = getStudentPerformanceStats(student.id)
            
            return (
              <Card key={student.id} className="hover:shadow-lg transition-shadow">
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
                    {/* Performance Summary */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Average Performance</h4>
                        <p className="text-sm text-gray-500">Across all subjects</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{studentStats.averageScore.toFixed(1)}%</div>
                        <p className="text-sm text-gray-500">{studentStats.total} records</p>
                      </div>
                    </div>

                    {/* Recent Performance */}
                    <div>
                      <h4 className="font-medium mb-2">Recent Performance</h4>
                      <div className="space-y-2">
                        {performanceRecords
                          .filter(r => r.studentId === student.id)
                          .slice(0, 3)
                          .map((record) => (
                            <div key={record.id} className="flex items-center justify-between text-sm">
                              <div className="flex items-center space-x-2">
                                <BookOpen className="h-4 w-4 text-gray-400" />
                                <span>{record.subject}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span>{((record.score / record.maxScore) * 100).toFixed(0)}%</span>
                                <Badge variant="outline" className="text-xs">{record.grade}</Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Performance Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Records</CardTitle>
            <CardDescription>
              Detailed performance records
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
                    <TableHead>Subject</TableHead>
                    <TableHead>Assessment</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPerformanceRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4 text-gray-400" />
                          <div>
                            <div className="font-medium">{record.studentName}</div>
                            <div className="text-sm text-gray-500">{record.registrationNumber}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <BookOpen className="h-4 w-4 text-gray-400" />
                          <span>{record.subject}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getAssessmentTypeBadge(record.assessmentType)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Target className="h-4 w-4 text-gray-400" />
                          <span>{record.score}/{record.maxScore}</span>
                          <span className="text-sm text-gray-500">
                            ({((record.score / record.maxScore) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${getGradeColor(record.grade || '')}`}>
                          {record.grade || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(record.assessmentDate).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {record.remarks ? (
                          <span className="text-sm text-gray-600">{record.remarks}</span>
                        ) : (
                          <span className="text-sm text-gray-400">No remarks</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Exam Results */}
        <Card>
          <CardHeader>
            <CardTitle>Exam Results</CardTitle>
            <CardDescription>
              Official exam results and rankings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <div key={result.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold">{result.studentName}</h4>
                      <p className="text-sm text-gray-500">{result.examType} - {result.term} ({result.academicYear})</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{result.percentage.toFixed(1)}%</div>
                      <Badge variant="outline" className="mt-1">Grade {result.grade}</Badge>
                      {result.rank && <p className="text-sm text-gray-500">Rank: #{result.rank}</p>}
                    </div>
                  </div>
                  
                  {/* Subject-wise Performance */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    {result.subjects.map((subject, index) => (
                      <div key={index} className="text-center p-3 border rounded">
                        <h5 className="font-medium text-sm">{subject.subject}</h5>
                        <div className="text-lg font-bold">{subject.marks}/{subject.maxMarks}</div>
                        <Badge variant="outline" className="text-xs mt-1">{subject.grade}</Badge>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Total: {result.totalMarks}/{result.maxTotalMarks} marks</span>
                    <span>{new Date(result.publishedAt).toLocaleDateString()}</span>
                  </div>
                  
                  {result.remarks && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">
                        <strong>Remarks:</strong> {result.remarks}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}