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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRequireAuth } from '@/hooks/use-auth'
import {
  Search,
  Download,
  Award,
  Calendar,
  GraduationCap,
  TrendingUp,
  BarChart3,
  FileText,
  Target,
  Users,
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
  parentId: string | null
}

interface Result {
  id: string
  studentId: string
  examType: 'MIDTERM' | 'FINAL' | 'UNIT_TEST' | 'PRACTICAL'
  term: string
  academicYear: string
  totalMarks: number
  maxTotalMarks: number
  percentage: number
  grade: string
  rank?: number
  publishedAt: string
}

export default function ResultsPage() {
  const { user, isAuthorized } = useRequireAuth('PARENT')
  const [students, setStudents] = useState<Student[]>([])
  const [results, setResults] = useState<Result[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<string>('')
  const [selectedExamType, setSelectedExamType] = useState<string>('')
  const [selectedTerm, setSelectedTerm] = useState<string>('')
  const [selectedYear, setSelectedYear] = useState<string>('')
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedResult, setSelectedResult] = useState<Result | null>(null)

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

      // Fetch results for children
      if (parentChildren.length > 0) {
        const resultsPromises = parentChildren.map((child: Student) =>
          fetch(`/api/results?studentId=${child.id}`).then(res => res.json())
        )
        const resultsResponses = await Promise.all(resultsPromises)
        const resultsData = resultsResponses.map((res: any) => res.data || []).flat()
        setResults(resultsData)
      }
    } catch (error: any) {
      console.error('Error loading results data:', error)
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

  const filteredResults = results.filter(result => {
    const matchesStudent = !selectedStudent || result.studentId === selectedStudent
    const matchesExamType = !selectedExamType || result.examType === selectedExamType
    const matchesTerm = !selectedTerm || result.term === selectedTerm
    const matchesYear = !selectedYear || result.academicYear === selectedYear
    return matchesStudent && matchesExamType && matchesTerm && matchesYear
  })

  const getResultsStats = () => {
    const results = filteredResults
    const total = results.length
    const averagePercentage = total > 0 ? results.reduce((sum, r) => sum + r.percentage, 0) / total : 0

    const gradeDistribution = {
      A: results.filter(r => r.grade === 'A').length,
      B: results.filter(r => r.grade === 'B').length,
      C: results.filter(r => r.grade === 'C').length,
      D: results.filter(r => r.grade === 'D').length,
      F: results.filter(r => r.grade === 'F').length,
    }

    const examTypeDistribution = {
      MIDTERM: results.filter(r => r.examType === 'MIDTERM').length,
      FINAL: results.filter(r => r.examType === 'FINAL').length,
      UNIT_TEST: results.filter(r => r.examType === 'UNIT_TEST').length,
      PRACTICAL: results.filter(r => r.examType === 'PRACTICAL').length,
    }

    return { total, averagePercentage, gradeDistribution, examTypeDistribution }
  }

  const getStudentResultsStats = (studentId: string) => {
    const studentResults = results.filter(r => r.studentId === studentId)
    const total = studentResults.length
    const averagePercentage = total > 0 ? studentResults.reduce((sum, r) => sum + r.percentage, 0) / total : 0

    return { total, averagePercentage }
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

  const getExamTypeColor = (type: string) => {
    const colors = {
      'MIDTERM': 'text-blue-600',
      'FINAL': 'text-red-600',
      'UNIT_TEST': 'text-purple-600',
      'PRACTICAL': 'text-orange-600',
    }
    return colors[type as keyof typeof colors] || 'text-gray-600'
  }

  const getSelectedStudent = () => {
    if (!selectedResult) return null
    return students.find(s => s.id === selectedResult.studentId)
  }

  const openDetailsDialog = (result: Result) => {
    setSelectedResult(result)
    setIsDetailsDialogOpen(true)
  }

  const handleExportResults = async () => {
    try {
      // Mock export functionality
      toast.success('Results report downloaded successfully')
    } catch (error) {
      toast.error('Failed to download results report')
    }
  }

  const stats = getResultsStats()

  if (!isAuthorized) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout title="Exam Results" subtitle="View official exam results and performance">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Results</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Exam results</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.averagePercentage.toFixed(1)}%</div>
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
              <p className="text-xs text-muted-foreground">Grade A results</p>
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
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Grade Distribution</CardTitle>
              <CardDescription>
                Overview of exam grades
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
          
          <Card>
            <CardHeader>
              <CardTitle>Exam Type Distribution</CardTitle>
              <CardDescription>
                Results by exam type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {Object.entries(stats.examTypeDistribution).map(([type, count]) => (
                  <div key={type} className="text-center">
                    <div className="text-2xl font-bold">{count}</div>
                    <Badge variant="outline" className={`mt-1 ${getExamTypeColor(type)}`}>
                      {type.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
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
            
            <Select
              value={selectedExamType || '__ALL__'}
              onValueChange={(v) => setSelectedExamType(v === '__ALL__' ? '' : v)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Exam type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All Types</SelectItem>
                <SelectItem value="MIDTERM">Midterm</SelectItem>
                <SelectItem value="FINAL">Final</SelectItem>
                <SelectItem value="UNIT_TEST">Unit Test</SelectItem>
                <SelectItem value="PRACTICAL">Practical</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={selectedTerm || '__ALL__'}
              onValueChange={(v) => setSelectedTerm(v === '__ALL__' ? '' : v)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All Terms</SelectItem>
                <SelectItem value="Term 1">Term 1</SelectItem>
                <SelectItem value="Term 2">Term 2</SelectItem>
              </SelectContent>
            </Select>
            
            <Select
              value={selectedYear || '__ALL__'}
              onValueChange={(v) => setSelectedYear(v === '__ALL__' ? '' : v)}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__ALL__">All Years</SelectItem>
                <SelectItem value="2023-2024">2023-2024</SelectItem>
                <SelectItem value="2022-2023">2022-2023</SelectItem>
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
          
          <Button onClick={handleExportResults}>
            <Download className="mr-2 h-4 w-4" />
            Export Results
          </Button>
        </div>

        {/* Children Overview */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredStudents.map((student) => {
            const studentStats = getStudentResultsStats(student.id)
            const latestResult = results
              .filter(r => r.studentId === student.id)
              .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())[0]
            
            return (
              <Card key={student.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <GraduationCap className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{student.firstName} {student.lastName}</CardTitle>
                      <CardDescription>{student.className || 'No class assigned'}</CardDescription>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">{student.registrationNumber}</Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Latest Result */}
                    {latestResult && (
                      <div className="p-3 border rounded-lg bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h5 className="font-medium text-sm">{latestResult.examType}</h5>
                            <p className="text-xs text-gray-500">{latestResult.term} • {latestResult.academicYear}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">{latestResult.percentage.toFixed(1)}%</div>
                            <Badge variant="outline" className="mt-1">Grade {latestResult.grade}</Badge>
                            {latestResult.rank && <p className="text-xs text-gray-500">Rank: #{latestResult.rank}</p>}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Performance Summary */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">Average Performance</h4>
                        <p className="text-sm text-gray-500">Across all exams</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{studentStats.averagePercentage.toFixed(1)}%</div>
                        <p className="text-sm text-gray-500">{studentStats.total} results</p>
                      </div>
                    </div>

                    {/* Recent Results */}
                    <div>
                      <h4 className="font-medium mb-2">Recent Results</h4>
                      <div className="space-y-2">
                        {results
                          .filter(r => r.studentId === student.id)
                          .slice(0, 2)
                          .map((result) => (
                            <div key={result.id} className="flex items-center justify-between text-sm p-2 border rounded">
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4 text-gray-400" />
                                <span>{result.examType}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span>{result.percentage.toFixed(1)}%</span>
                                <Badge variant="outline" className="text-xs">{result.grade}</Badge>
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

        {/* Results Table */}
        <Card>
          <CardHeader>
            <CardTitle>Exam Results</CardTitle>
            <CardDescription>
              Official exam results and rankings
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
                    <TableHead>Exam Type</TableHead>
                    <TableHead>Term</TableHead>
                    <TableHead>Total Marks</TableHead>
                    <TableHead>Percentage</TableHead>
                    <TableHead>Grade</TableHead>
                    <TableHead>Rank</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result) => {
                    const student = students.find(s => s.id === result.studentId)
                    if (!student) return null
                    return (
                      <TableRow key={result.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="h-4 w-4 text-gray-400" />
                            <div>
                              <div className="font-medium">{student.firstName} {student.lastName}</div>
                              <div className="text-sm text-gray-500">{student.registrationNumber}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-medium ${getExamTypeColor(result.examType)}`}>
                            {result.examType.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell>{result.term}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Target className="h-4 w-4 text-gray-400" />
                            <span>{result.totalMarks}/{result.maxTotalMarks}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-lg font-bold text-green-600">{result.percentage.toFixed(1)}%</div>
                        </TableCell>
                        <TableCell>
                          <span className={`font-semibold ${getGradeColor(result.grade)}`}>
                            Grade {result.grade}
                          </span>
                        </TableCell>
                        <TableCell>
                          {result.rank ? (
                            <Badge variant="outline" className="text-blue-600">#{result.rank}</Badge>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{new Date(result.publishedAt).toLocaleDateString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetailsDialog(result)}
                          >
                            <FileText className="h-4 w-4" />
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

        {/* Result Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Result Details</DialogTitle>
              <DialogDescription>
                Complete information about the exam result
              </DialogDescription>
            </DialogHeader>
            {(() => {
              const student = selectedResult ? students.find(s => s.id === selectedResult.studentId) : null
              if (!selectedResult || !student) return null
              return (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Student Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Name:</span>
                          <span className="text-sm">{student.firstName} {student.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Registration:</span>
                          <span className="text-sm">{student.registrationNumber}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Class:</span>
                          <span className="text-sm">{student.className || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Exam Information</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Exam Type:</span>
                          <span className="text-sm font-medium">{selectedResult.examType.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Term:</span>
                          <span className="text-sm">{selectedResult.term}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-500">Academic Year:</span>
                          <span className="text-sm">{selectedResult.academicYear}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{selectedResult.percentage.toFixed(1)}%</div>
                      <p className="text-sm text-gray-500">Percentage</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{selectedResult.totalMarks}/{selectedResult.maxTotalMarks}</div>
                      <p className="text-sm text-gray-500">Total Marks</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">Grade {selectedResult.grade}</div>
                      <p className="text-sm text-gray-500">Grade</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">{selectedResult.rank ? `#${selectedResult.rank}` : 'N/A'}</div>
                      <p className="text-sm text-gray-500">Rank</p>
                    </div>
                  </div>
                </div>
              )
            })()}
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