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
import { useRequireAuth } from '@/hooks/use-auth'
import {
  Search,
  Download,
  FileText,
  Calendar,
  Filter,
  BarChart3,
  Users,
  GraduationCap,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  FileSpreadsheet,
  FilePdf,
  UserCheck,
} from 'lucide-react'
import { toast } from 'sonner'

interface Report {
  id: string
  name: string
  type: 'ATTENDANCE' | 'PERFORMANCE' | 'RESULTS' | 'STUDENT_LIST' | 'TEACHER_ACTIVITY' | 'PARENT_LIST'
  parameters: any
  status: 'GENERATING' | 'COMPLETED' | 'FAILED'
  generatedBy: string
  generatedByName: string
  generatedAt: string
  fileUrl?: string
  fileSize?: number
}

export default function ReportsPage() {
  const { user, isAuthorized } = useRequireAuth('ADMIN')
  const [reports, setReports] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    type: '',
    dateFrom: '',
    dateTo: '',
    classId: '',
    studentId: '',
    teacherId: '',
  })

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockReports: Report[] = [
      {
        id: '1',
        name: 'Monthly Attendance Report',
        type: 'ATTENDANCE',
        parameters: { dateFrom: '2024-02-01', dateTo: '2024-02-29' },
        status: 'COMPLETED',
        generatedBy: 'admin1',
        generatedByName: 'Admin User',
        generatedAt: '2024-03-01T10:00:00Z',
        fileUrl: '/reports/attendance_february_2024.pdf',
        fileSize: 2048576,
      },
      {
        id: '2',
        name: 'Student Performance Report',
        type: 'PERFORMANCE',
        parameters: { dateFrom: '2024-02-01', dateTo: '2024-02-29', classId: '1' },
        status: 'COMPLETED',
        generatedBy: 'admin1',
        generatedByName: 'Admin User',
        generatedAt: '2024-03-01T11:30:00Z',
        fileUrl: '/reports/performance_february_2024.xlsx',
        fileSize: 1048576,
      },
      {
        id: '3',
        name: 'Final Results Report',
        type: 'RESULTS',
        parameters: { term: 'Final', academicYear: '2023-2024' },
        status: 'GENERATING',
        generatedBy: 'admin1',
        generatedByName: 'Admin User',
        generatedAt: '2024-03-15T09:00:00Z',
      },
      {
        id: '4',
        name: 'Complete Student List',
        type: 'STUDENT_LIST',
        parameters: { includeInactive: false },
        status: 'COMPLETED',
        generatedBy: 'admin1',
        generatedByName: 'Admin User',
        generatedAt: '2024-03-10T14:20:00Z',
        fileUrl: '/reports/student_list_march_2024.csv',
        fileSize: 524288,
      },
      {
        id: '5',
        name: 'Teacher Activity Report',
        type: 'TEACHER_ACTIVITY',
        parameters: { dateFrom: '2024-03-01', dateTo: '2024-03-15' },
        status: 'FAILED',
        generatedBy: 'admin1',
        generatedByName: 'Admin User',
        generatedAt: '2024-03-15T15:45:00Z',
      },
    ]
    
    setTimeout(() => {
      setReports(mockReports)
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredReports = reports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.generatedByName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter
    const matchesType = typeFilter === 'all' || report.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const completedReports = filteredReports.filter(r => r.status === 'COMPLETED')
  const generatingReports = filteredReports.filter(r => r.status === 'GENERATING')
  const failedReports = filteredReports.filter(r => r.status === 'FAILED')

  const handleGenerateReport = async () => {
    try {
      if (!formData.type) {
        toast.error('Please select a report type')
        return
      }

      // Mock API call
      const newReport: Report = {
        id: Date.now().toString(),
        name: getReportName(formData.type),
        type: formData.type as any,
        parameters: {
          dateFrom: formData.dateFrom,
          dateTo: formData.dateTo,
          classId: formData.classId,
          studentId: formData.studentId,
          teacherId: formData.teacherId,
        },
        status: 'GENERATING',
        generatedBy: user?.id || 'admin1',
        generatedByName: user?.name || 'Admin User',
        generatedAt: new Date().toISOString(),
      }

      setReports(prev => [newReport, ...prev])
      setIsCreateDialogOpen(false)
      setFormData({
        type: '',
        dateFrom: '',
        dateTo: '',
        classId: '',
        studentId: '',
        teacherId: '',
      })
      
      toast.success('Report generation started')
      
      // Simulate report completion after 3 seconds
      setTimeout(() => {
        setReports(prev => prev.map(r => 
          r.id === newReport.id 
            ? { 
                ...r, 
                status: 'COMPLETED',
                fileUrl: `/reports/${newReport.type.toLowerCase()}_${Date.now()}.${getFileExtension(newReport.type)}`,
                fileSize: Math.floor(Math.random() * 5000000) + 500000
              } 
            : r
        ))
        toast.success('Report generated successfully')
      }, 3000)
    } catch (error) {
      toast.error('Failed to generate report')
    }
  }

  const handleDownloadReport = async (report: Report) => {
    try {
      if (!report.fileUrl) {
        toast.error('Report file not available')
        return
      }
      
      // Mock download
      toast.success(`Downloading ${report.name}...`)
      
      // Simulate download completion
      setTimeout(() => {
        toast.success(`${report.name} downloaded successfully`)
      }, 2000)
    } catch (error) {
      toast.error('Failed to download report')
    }
  }

  const getReportName = (type: string) => {
    const names = {
      ATTENDANCE: 'Attendance Report',
      PERFORMANCE: 'Performance Report',
      RESULTS: 'Results Report',
      STUDENT_LIST: 'Student List Report',
      TEACHER_ACTIVITY: 'Teacher Activity Report',
      PARENT_LIST: 'Parent List Report',
    }
    return names[type as keyof typeof names] || 'Custom Report'
  }

  const getFileExtension = (type: string) => {
    const extensions = {
      ATTENDANCE: 'pdf',
      PERFORMANCE: 'xlsx',
      RESULTS: 'pdf',
      STUDENT_LIST: 'csv',
      TEACHER_ACTIVITY: 'xlsx',
      PARENT_LIST: 'csv',
    }
    return extensions[type as keyof typeof extensions] || 'pdf'
  }

  const getFileIcon = (type: string) => {
    const extension = getFileExtension(type)
    switch (extension) {
      case 'pdf':
        return <FileText className="h-4 w-4 text-red-500" />
      case 'xlsx':
        return <FileSpreadsheet className="h-4 w-4 text-green-500" />
      case 'csv':
        return <FileText className="h-4 w-4 text-blue-500" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'GENERATING':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Generating</Badge>
      case 'COMPLETED':
        return <Badge variant="default" className="bg-green-100 text-green-800">Completed</Badge>
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (!isAuthorized) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout title="Reports Management" subtitle="Generate and download system reports">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredReports.length}</div>
              <p className="text-xs text-muted-foreground">All reports</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedReports.length}</div>
              <p className="text-xs text-muted-foreground">Ready to download</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Generating</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{generatingReports.length}</div>
              <p className="text-xs text-muted-foreground">In progress</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Failed</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{failedReports.length}</div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="ATTENDANCE">Attendance</SelectItem>
                <SelectItem value="PERFORMANCE">Performance</SelectItem>
                <SelectItem value="RESULTS">Results</SelectItem>
                <SelectItem value="STUDENT_LIST">Student List</SelectItem>
                <SelectItem value="TEACHER_ACTIVITY">Teacher Activity</SelectItem>
                <SelectItem value="PARENT_LIST">Parent List</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="GENERATING">Generating</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <BarChart3 className="mr-2 h-4 w-4" />
                Generate Report
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Generate New Report</DialogTitle>
                <DialogDescription>
                  Create a new report from the available options.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Report Type</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ATTENDANCE">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4" />
                          <span>Attendance Report</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="PERFORMANCE">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="h-4 w-4" />
                          <span>Performance Report</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="RESULTS">
                        <div className="flex items-center space-x-2">
                          <GraduationCap className="h-4 w-4" />
                          <span>Results Report</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="STUDENT_LIST">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4" />
                          <span>Student List</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="TEACHER_ACTIVITY">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>Teacher Activity</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="PARENT_LIST">
                        <div className="flex items-center space-x-2">
                          <UserCheck className="h-4 w-4" />
                          <span>Parent List</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {(formData.type === 'ATTENDANCE' || formData.type === 'PERFORMANCE' || formData.type === 'TEACHER_ACTIVITY') && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dateFrom">From Date</Label>
                      <Input
                        id="dateFrom"
                        type="date"
                        value={formData.dateFrom}
                        onChange={(e) => setFormData(prev => ({ ...prev, dateFrom: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dateTo">To Date</Label>
                      <Input
                        id="dateTo"
                        type="date"
                        value={formData.dateTo}
                        onChange={(e) => setFormData(prev => ({ ...prev, dateTo: e.target.value }))}
                      />
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="classId">Class (Optional)</Label>
                    <Input
                      id="classId"
                      value={formData.classId}
                      onChange={(e) => setFormData(prev => ({ ...prev, classId: e.target.value }))}
                      placeholder="Class ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="studentId">Student (Optional)</Label>
                    <Input
                      id="studentId"
                      value={formData.studentId}
                      onChange={(e) => setFormData(prev => ({ ...prev, studentId: e.target.value }))}
                      placeholder="Student ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="teacherId">Teacher (Optional)</Label>
                    <Input
                      id="teacherId"
                      value={formData.teacherId}
                      onChange={(e) => setFormData(prev => ({ ...prev, teacherId: e.target.value }))}
                      placeholder="Teacher ID"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleGenerateReport}>Generate Report</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Reports Table */}
        <Card>
          <CardHeader>
            <CardTitle>Reports ({filteredReports.length})</CardTitle>
            <CardDescription>
              View and download generated reports.
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
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Generated By</TableHead>
                    <TableHead>Generated At</TableHead>
                    <TableHead>File Size</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {report.fileUrl ? getFileIcon(report.type) : <Clock className="h-4 w-4 text-gray-400" />}
                          <div>
                            <div className="font-medium">{report.name}</div>
                            <div className="text-sm text-gray-500">
                              {report.parameters.dateFrom && report.parameters.dateTo && 
                                `${report.parameters.dateFrom} to ${report.parameters.dateTo}`
                              }
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {report.type.toLowerCase().replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(report.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <UserCheck className="h-4 w-4 text-gray-400" />
                          <span>{report.generatedByName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(report.generatedAt).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {report.fileSize ? formatFileSize(report.fileSize) : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {report.status === 'COMPLETED' && report.fileUrl && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadReport(report)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          {report.status === 'GENERATING' && (
                            <div className="flex items-center space-x-2 text-sm text-yellow-600">
                              <Clock className="h-4 w-4 animate-spin" />
                              <span>Generating...</span>
                            </div>
                          )}
                          {report.status === 'FAILED' && (
                            <Badge variant="destructive" className="text-xs">
                              Failed
                            </Badge>
                          )}
                        </div>
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