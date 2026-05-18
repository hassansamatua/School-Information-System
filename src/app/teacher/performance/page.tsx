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
  TrendingUp,
  Calendar,
  Users,
  GraduationCap,
  Award,
  BookOpen,
  Target,
  AlertCircle,
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

interface Class {
  id: string
  name: string
  grade: string
  section: string
  studentCount: number
}

export default function PerformancePage() {
  const { user, isAuthorized } = useRequireAuth('TEACHER')
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [performanceRecords, setPerformanceRecords] = useState<PerformanceRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [isAddPerformanceDialogOpen, setIsAddPerformanceDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    studentId: '',
    subject: '',
    assessmentType: '',
    score: '',
    maxScore: '',
    remarks: '',
    assessmentDate: new Date().toISOString().split('T')[0],
  })

  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Art', 'Music', 'Physical Education']

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockStudents: Student[] = [
      { id: '1', registrationNumber: 'REG2024001', firstName: 'Alice', lastName: 'Johnson', classId: '1', className: 'Grade 5-A' },
      { id: '2', registrationNumber: 'REG2024002', firstName: 'Bob', lastName: 'Smith', classId: '1', className: 'Grade 5-A' },
      { id: '3', registrationNumber: 'REG2024003', firstName: 'Charlie', lastName: 'Brown', classId: '1', className: 'Grade 5-A' },
      { id: '4', registrationNumber: 'REG2024004', firstName: 'Diana', lastName: 'Davis', classId: '2', className: 'Grade 6-B' },
      { id: '5', registrationNumber: 'REG2024005', firstName: 'Edward', lastName: 'Wilson', classId: '2', className: 'Grade 6-B' },
    ]

    const mockClasses: Class[] = [
      { id: '1', name: 'Grade 5-A', grade: '5', section: 'A', studentCount: 3 },
      { id: '2', name: 'Grade 6-B', grade: '6', section: 'B', studentCount: 2 },
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
        studentId: '2',
        studentName: 'Bob Smith',
        registrationNumber: 'REG2024002',
        classId: '1',
        className: 'Grade 5-A',
        subject: 'Mathematics',
        assessmentType: 'TEST',
        score: 92,
        maxScore: 100,
        grade: 'A',
        remarks: 'Excellent work',
        assessmentDate: '2024-03-10',
        recordedAt: '2024-03-10T15:30:00Z',
      },
      {
        id: '3',
        studentId: '3',
        studentName: 'Charlie Brown',
        registrationNumber: 'REG2024003',
        classId: '1',
        className: 'Grade 5-A',
        subject: 'Science',
        assessmentType: 'QUIZ',
        score: 78,
        maxScore: 100,
        grade: 'C',
        remarks: 'Needs improvement',
        assessmentDate: '2024-03-12',
        recordedAt: '2024-03-12T14:20:00Z',
      },
    ]

    setTimeout(() => {
      setStudents(mockStudents)
      setClasses(mockClasses)
      setPerformanceRecords(mockPerformanceRecords)
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredStudents = students.filter(student => {
    const matchesClass = !selectedClass || student.classId === selectedClass
    const matchesSearch = student.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesClass && matchesSearch
  })

  const filteredPerformanceRecords = performanceRecords.filter(record => {
    const matchesClass = !selectedClass || record.classId === selectedClass
    const matchesSubject = !selectedSubject || record.subject === selectedSubject
    return matchesClass && matchesSubject
  })

  const handleAddPerformance = async () => {
    try {
      if (!formData.studentId || !formData.subject || !formData.assessmentType || !formData.score || !formData.maxScore) {
        toast.error('Please fill in all required fields')
        return
      }

      const score = parseFloat(formData.score)
      const maxScore = parseFloat(formData.maxScore)

      if (score > maxScore) {
        toast.error('Score cannot be greater than maximum score')
        return
      }

      // Calculate grade
      const percentage = (score / maxScore) * 100
      let grade = 'F'
      if (percentage >= 90) grade = 'A'
      else if (percentage >= 80) grade = 'B'
      else if (percentage >= 70) grade = 'C'
      else if (percentage >= 60) grade = 'D'

      const student = students.find(s => s.id === formData.studentId)
      const record = {
        studentId: formData.studentId,
        classId: student?.classId || '',
        subject: formData.subject,
        assessmentType: formData.assessmentType,
        score,
        maxScore,
        grade,
        remarks: formData.remarks || undefined,
        assessmentDate: formData.assessmentDate,
      }

      const studentName = student ? `${student.firstName} ${student.lastName}` : 'student'
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'PERFORMANCE',
          title: `${formData.subject} - ${formData.assessmentType} - ${studentName}`,
          content: `${formData.assessmentType} score ${score}/${maxScore} (${grade}) for ${studentName}`,
          targetAudience: 'SPECIFIC_STUDENT',
          targetId: formData.studentId,
          data: { records: [record] },
          submitNow: true,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Failed (${res.status})`)
      }

      // Optimistic local UI update.
      const newRecord: PerformanceRecord = {
        id: Date.now().toString(),
        studentId: formData.studentId,
        studentName: student ? `${student.firstName} ${student.lastName}` : 'Unknown',
        registrationNumber: student?.registrationNumber || '',
        classId: student?.classId || '',
        className: student?.className || '',
        subject: formData.subject,
        assessmentType: formData.assessmentType as any,
        score,
        maxScore,
        grade,
        remarks: formData.remarks,
        assessmentDate: formData.assessmentDate,
        recordedAt: new Date().toISOString(),
      }
      setPerformanceRecords(prev => [newRecord, ...prev])
      setIsAddPerformanceDialogOpen(false)
      setFormData({
        studentId: '',
        subject: '',
        assessmentType: '',
        score: '',
        maxScore: '',
        remarks: '',
        assessmentDate: new Date().toISOString().split('T')[0],
      })
      toast.success('Performance submitted for approval')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit performance')
    }
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

  const getPerformanceStats = () => {
    const records = filteredPerformanceRecords
    const total = records.length
    const averageScore = total > 0 ? records.reduce((sum, r) => sum + (r.score / r.maxScore) * 100, 0) / total : 0
    const averageGrade = total > 0 ? records.reduce((sum, r) => sum + (r.score / r.maxScore) * 100, 0) / total : 0

    const gradeDistribution = {
      A: records.filter(r => r.grade === 'A').length,
      B: records.filter(r => r.grade === 'B').length,
      C: records.filter(r => r.grade === 'C').length,
      D: records.filter(r => r.grade === 'D').length,
      F: records.filter(r => r.grade === 'F').length,
    }

    return { total, averageScore, averageGrade, gradeDistribution }
  }

  const stats = getPerformanceStats()

  if (!isAuthorized) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout title="Performance Management" subtitle="Track and manage student performance">
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
              <p className="text-xs text-muted-foreground">Grade A students</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Need Help</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.gradeDistribution.F + stats.gradeDistribution.D}</div>
              <p className="text-xs text-muted-foreground">Below average students</p>
            </CardContent>
          </Card>
        </div>

        {/* Grade Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>
              Overview of student performance grades
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
            
            <Select
              value={selectedSubject || '__ALL__'}
              onValueChange={(v) => setSelectedSubject(v === '__ALL__' ? '' : v)}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All Subjects</SelectItem>
                {subjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
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
          
          <Dialog open={isAddPerformanceDialogOpen} onOpenChange={setIsAddPerformanceDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Performance
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Add Performance Record</DialogTitle>
                <DialogDescription>
                  Record student performance for an assessment
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student</Label>
                    <Select value={formData.studentId} onValueChange={(value) => setFormData(prev => ({ ...prev, studentId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredStudents.map((student) => (
                          <SelectItem key={student.id} value={student.id}>
                            {student.firstName} {student.lastName} ({student.registrationNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="assessmentType">Assessment Type</Label>
                    <Select value={formData.assessmentType} onValueChange={(value) => setFormData(prev => ({ ...prev, assessmentType: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="QUIZ">Quiz</SelectItem>
                        <SelectItem value="TEST">Test</SelectItem>
                        <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                        <SelectItem value="PROJECT">Project</SelectItem>
                        <SelectItem value="EXAM">Exam</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="assessmentDate">Assessment Date</Label>
                    <Input
                      id="assessmentDate"
                      type="date"
                      value={formData.assessmentDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, assessmentDate: e.target.value }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="score">Score</Label>
                    <Input
                      id="score"
                      type="number"
                      min="0"
                      value={formData.score}
                      onChange={(e) => setFormData(prev => ({ ...prev, score: e.target.value }))}
                      placeholder="Score achieved"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxScore">Maximum Score</Label>
                    <Input
                      id="maxScore"
                      type="number"
                      min="1"
                      value={formData.maxScore}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxScore: e.target.value }))}
                      placeholder="Maximum possible score"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks (Optional)</Label>
                  <Textarea
                    id="remarks"
                    value={formData.remarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, remarks: e.target.value }))}
                    placeholder="Add any comments about the performance..."
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddPerformanceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddPerformance}>Add Record</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Performance Records Table */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Records</CardTitle>
            <CardDescription>
              View and manage student performance records
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
      </div>
    </DashboardLayout>
  )
}