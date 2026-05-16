'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout, PageHeader } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  FileText,
  Calendar,
  Bell,
  User,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'sonner'

interface Submission {
  id: string
  type: 'ANNOUNCEMENT' | 'EVENT' | 'ATTENDANCE' | 'PERFORMANCE'
  title: string
  content: string
  targetAudience: 'ALL' | 'TEACHERS' | 'PARENTS' | 'SPECIFIC_CLASS' | 'SPECIFIC_STUDENT'
  targetId?: string
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED'
  submittedBy: string
  submittedByName: string
  submittedAt: string
  rejectionReason?: string
  data?: any
}

export default function ApprovalsPage() {
  const { user, isAuthorized } = useRequireAuth('ADMIN')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [approvalForm, setApprovalForm] = useState({
    status: 'APPROVED' as 'APPROVED' | 'REJECTED',
    comments: '',
  })

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockSubmissions: Submission[] = [
      {
        id: '1',
        type: 'ANNOUNCEMENT',
        title: 'School Meeting Tomorrow',
        content: 'There will be a school meeting tomorrow at 10 AM in the main hall. All teachers are required to attend.',
        targetAudience: 'TEACHERS',
        status: 'PENDING_APPROVAL',
        submittedBy: 'teacher1',
        submittedByName: 'John Smith',
        submittedAt: '2024-03-15T10:30:00Z',
      },
      {
        id: '2',
        type: 'EVENT',
        title: 'Science Fair',
        content: 'Annual science fair will be held next month. Students are encouraged to participate with their projects.',
        targetAudience: 'ALL',
        status: 'PENDING_APPROVAL',
        submittedBy: 'teacher2',
        submittedByName: 'Sarah Johnson',
        submittedAt: '2024-03-15T09:15:00Z',
      },
      {
        id: '3',
        type: 'PERFORMANCE',
        title: 'Grade 5 Math Test Results',
        content: 'Math test results for Grade 5 students have been recorded.',
        targetAudience: 'SPECIFIC_CLASS',
        targetId: 'class1',
        status: 'APPROVED',
        submittedBy: 'teacher3',
        submittedByName: 'Michael Brown',
        submittedAt: '2024-03-14T14:20:00Z',
      },
      {
        id: '4',
        type: 'ANNOUNCEMENT',
        title: 'Holiday Schedule',
        content: 'Upcoming holiday schedule for the next month has been updated.',
        targetAudience: 'ALL',
        status: 'REJECTED',
        submittedBy: 'teacher1',
        submittedByName: 'John Smith',
        submittedAt: '2024-03-13T11:45:00Z',
        rejectionReason: 'Please provide specific dates for the holidays',
      },
      {
        id: '5',
        type: 'ATTENDANCE',
        title: 'Class 6-B Attendance',
        content: 'Daily attendance for Class 6-B has been recorded.',
        targetAudience: 'SPECIFIC_CLASS',
        targetId: 'class2',
        status: 'PENDING_APPROVAL',
        submittedBy: 'teacher2',
        submittedByName: 'Sarah Johnson',
        submittedAt: '2024-03-15T08:00:00Z',
      },
    ]
    
    setTimeout(() => {
      setSubmissions(mockSubmissions)
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         submission.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         submission.submittedByName.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter
    const matchesType = typeFilter === 'all' || submission.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const pendingSubmissions = filteredSubmissions.filter(s => s.status === 'PENDING_APPROVAL')
  const approvedSubmissions = filteredSubmissions.filter(s => s.status === 'APPROVED')
  const rejectedSubmissions = filteredSubmissions.filter(s => s.status === 'REJECTED')

  const handleApprove = async () => {
    try {
      if (!selectedSubmission) return

      // Mock API call
      const updatedSubmission = {
        ...selectedSubmission,
        status: approvalForm.status as 'APPROVED' | 'REJECTED',
        rejectionReason: approvalForm.status === 'REJECTED' ? approvalForm.comments : undefined,
      }

      setSubmissions(prev => prev.map(s => 
        s.id === selectedSubmission.id ? updatedSubmission : s
      ))
      
      setIsApprovalDialogOpen(false)
      setSelectedSubmission(null)
      setApprovalForm({ status: 'APPROVED', comments: '' })
      
      toast.success(`Submission ${approvalForm.status.toLowerCase()} successfully`)
    } catch (error) {
      toast.error('Failed to process approval')
    }
  }

  const openDetailsDialog = (submission: Submission) => {
    setSelectedSubmission(submission)
    setIsDetailsDialogOpen(true)
  }

  const openApprovalDialog = (submission: Submission) => {
    setSelectedSubmission(submission)
    setApprovalForm({ status: 'APPROVED', comments: '' })
    setIsApprovalDialogOpen(true)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ANNOUNCEMENT':
        return <Bell className="h-4 w-4" />
      case 'EVENT':
        return <Calendar className="h-4 w-4" />
      case 'ATTENDANCE':
        return <CheckCircle className="h-4 w-4" />
      case 'PERFORMANCE':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">Draft</Badge>
    }
  }

  const getTargetAudienceText = (audience: string) => {
    switch (audience) {
      case 'ALL':
        return 'Everyone'
      case 'TEACHERS':
        return 'Teachers Only'
      case 'PARENTS':
        return 'Parents Only'
      case 'SPECIFIC_CLASS':
        return 'Specific Class'
      case 'SPECIFIC_STUDENT':
        return 'Specific Student'
      default:
        return audience
    }
  }

  if (!isAuthorized) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout title="Approvals Management" subtitle="Review and approve teacher submissions">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingSubmissions.length}</div>
              <p className="text-xs text-muted-foreground">Waiting for review</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedSubmissions.length}</div>
              <p className="text-xs text-muted-foreground">Approved submissions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejectedSubmissions.length}</div>
              <p className="text-xs text-muted-foreground">Rejected submissions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredSubmissions.length}</div>
              <p className="text-xs text-muted-foreground">All submissions</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING_APPROVAL">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="ANNOUNCEMENT">Announcements</SelectItem>
              <SelectItem value="EVENT">Events</SelectItem>
              <SelectItem value="ATTENDANCE">Attendance</SelectItem>
              <SelectItem value="PERFORMANCE">Performance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Pending Approvals Section */}
        {pendingSubmissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-yellow-600">Pending Approvals ({pendingSubmissions.length})</CardTitle>
              <CardDescription>
                Submissions waiting for your review and approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Target Audience</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(submission.type)}
                          <span className="capitalize">{submission.type.toLowerCase()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{submission.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-2">
                            {submission.content.substring(0, 100)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{submission.submittedByName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getTargetAudienceText(submission.targetAudience)}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetailsDialog(submission)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openApprovalDialog(submission)}
                          >
                            Review
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* All Submissions Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Submissions ({filteredSubmissions.length})</CardTitle>
            <CardDescription>
              Complete history of all submissions
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
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Submitted By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((submission) => (
                    <TableRow key={submission.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(submission.type)}
                          <span className="capitalize">{submission.type.toLowerCase()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{submission.title}</div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {submission.content.substring(0, 50)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span>{submission.submittedByName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(submission.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{new Date(submission.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetailsDialog(submission)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {submission.status === 'PENDING_APPROVAL' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => openApprovalDialog(submission)}
                            >
                              Review
                            </Button>
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

        {/* Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Submission Details</DialogTitle>
              <DialogDescription>
                Complete information about this submission
              </DialogDescription>
            </DialogHeader>
            {selectedSubmission && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Type</label>
                    <div className="flex items-center space-x-2 mt-1">
                      {getTypeIcon(selectedSubmission.type)}
                      <span className="capitalize">{selectedSubmission.type.toLowerCase()}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedSubmission.status)}
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Title</label>
                  <p className="text-sm mt-1">{selectedSubmission.title}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Content</label>
                  <p className="text-sm mt-1 whitespace-pre-wrap">{selectedSubmission.content}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Submitted By</label>
                    <p className="text-sm mt-1">{selectedSubmission.submittedByName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Target Audience</label>
                    <p className="text-sm mt-1">{getTargetAudienceText(selectedSubmission.targetAudience)}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Submitted At</label>
                  <p className="text-sm mt-1">{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                </div>
                
                {selectedSubmission.rejectionReason && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Rejection Reason</label>
                    <p className="text-sm mt-1 text-red-600">{selectedSubmission.rejectionReason}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                Close
              </Button>
              {selectedSubmission?.status === 'PENDING_APPROVAL' && (
                <Button
                  onClick={() => {
                    setIsDetailsDialogOpen(false)
                    openApprovalDialog(selectedSubmission)
                  }}
                >
                  Review Submission
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Approval Dialog */}
        <Dialog open={isApprovalDialogOpen} onOpenChange={setIsApprovalDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Review Submission</DialogTitle>
              <DialogDescription>
                Approve or reject this submission
              </DialogDescription>
            </DialogHeader>
            {selectedSubmission && (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium">{selectedSubmission.title}</h4>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">{selectedSubmission.content}</p>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm text-gray-500">by {selectedSubmission.submittedByName}</span>
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{new Date(selectedSubmission.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="decision">Decision</Label>
                  <Select value={approvalForm.status} onValueChange={(value) => setApprovalForm(prev => ({ ...prev, status: value as 'APPROVED' | 'REJECTED' }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select decision" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="APPROVED">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Approve</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="REJECTED">
                        <div className="flex items-center space-x-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          <span>Reject</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {approvalForm.status === 'REJECTED' && (
                  <div className="space-y-2">
                    <Label htmlFor="comments">Rejection Reason (Required)</Label>
                    <Textarea
                      id="comments"
                      placeholder="Please provide a reason for rejection..."
                      value={approvalForm.comments}
                      onChange={(e) => setApprovalForm(prev => ({ ...prev, comments: e.target.value }))}
                      rows={3}
                    />
                  </div>
                )}
                
                {approvalForm.status === 'APPROVED' && (
                  <div className="space-y-2">
                    <Label htmlFor="comments">Comments (Optional)</Label>
                    <Textarea
                      id="comments"
                      placeholder="Add any comments for the submitter..."
                      value={approvalForm.comments}
                      onChange={(e) => setApprovalForm(prev => ({ ...prev, comments: e.target.value }))}
                      rows={3}
                    />
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsApprovalDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleApprove}
                disabled={approvalForm.status === 'REJECTED' && !approvalForm.comments.trim()}
              >
                {approvalForm.status === 'APPROVED' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}