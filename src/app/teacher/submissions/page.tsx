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
  Eye,
  FileText,
  Calendar,
  Bell,
  Users,
  AlertCircle,
  Send,
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
  submittedAt: string
  reviewedAt?: string
  rejectionReason?: string
  data?: any
}

interface Class {
  id: string
  name: string
  grade: string
  section: string
}

export default function SubmissionsPage() {
  const { user, isAuthorized } = useRequireAuth('TEACHER')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    content: '',
    targetAudience: '',
    targetId: '',
  })

  const loadSubmissions = async () => {
    try {
      const res = await fetch('/api/submissions')
      if (!res.ok) throw new Error(`Failed to load (${res.status})`)
      const data = await res.json()
      setSubmissions(data)
    } catch (e) {
      console.error(e)
      toast.error('Failed to load submissions')
    }
  }

  const loadClasses = async () => {
    try {
      const res = await fetch('/api/classes')
      if (!res.ok) return
      const data = await res.json()
      // /api/classes returns an array directly
      const list = Array.isArray(data) ? data : (data?.data || [])
      setClasses(
        list.map((c: any) => ({
          id: c.id,
          name: c.name,
          grade: String(c.form ?? ''),
          section: c.stream ?? '',
        }))
      )
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    if (!isAuthorized) return
    Promise.all([loadSubmissions(), loadClasses()]).finally(() => setIsLoading(false))
  }, [isAuthorized])

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         submission.content.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || submission.status === statusFilter
    const matchesType = typeFilter === 'all' || submission.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  const draftSubmissions = filteredSubmissions.filter(s => s.status === 'DRAFT')
  const pendingSubmissions = filteredSubmissions.filter(s => s.status === 'PENDING_APPROVAL')
  const approvedSubmissions = filteredSubmissions.filter(s => s.status === 'APPROVED')
  const rejectedSubmissions = filteredSubmissions.filter(s => s.status === 'REJECTED')

  const handleSubmitSubmission = async (submitNow = false) => {
    try {
      if (!formData.type || !formData.title || !formData.content || !formData.targetAudience) {
        toast.error('Please fill in all required fields')
        return
      }
      const res = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: formData.type,
          title: formData.title,
          content: formData.content,
          targetAudience: formData.targetAudience,
          targetId: formData.targetId || undefined,
          submitNow,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Failed (${res.status})`)
      }
      const created: Submission = await res.json()
      setSubmissions(prev => [created, ...prev])
      setIsCreateDialogOpen(false)
      setFormData({ type: '', title: '', content: '', targetAudience: '', targetId: '' })
      toast.success(submitNow ? 'Submission sent for approval' : 'Draft saved')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to create submission')
    }
  }

  const handleSubmitForApproval = async (submissionId: string) => {
    try {
      const res = await fetch(`/api/submissions/${submissionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submitNow: true }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Failed (${res.status})`)
      }
      const updated: Submission = await res.json()
      setSubmissions(prev => prev.map(s => (s.id === submissionId ? updated : s)))
      toast.success('Submission submitted for approval')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to submit for approval')
    }
  }

  const handleDeleteSubmission = async (submissionId: string) => {
    try {
      const res = await fetch(`/api/submissions/${submissionId}`, { method: 'DELETE' })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Failed (${res.status})`)
      }
      setSubmissions(prev => prev.filter(s => s.id !== submissionId))
      toast.success('Submission deleted')
    } catch (error: any) {
      toast.error(error?.message || 'Failed to delete submission')
    }
  }

  const openDetailsDialog = (submission: Submission) => {
    setSelectedSubmission(submission)
    setIsDetailsDialogOpen(true)
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
      case 'DRAFT':
        return <Badge variant="outline">Draft</Badge>
      case 'PENDING_APPROVAL':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>
      case 'REJECTED':
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
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
    <DashboardLayout title="Submissions Management" subtitle="Create and manage your submissions">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Draft</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{draftSubmissions.length}</div>
              <p className="text-xs text-muted-foreground">Not submitted yet</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingSubmissions.length}</div>
              <p className="text-xs text-muted-foreground">Waiting for approval</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedSubmissions.length}</div>
              <p className="text-xs text-muted-foreground">Published</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{rejectedSubmissions.length}</div>
              <p className="text-xs text-muted-foreground">Need revision</p>
            </CardContent>
          </Card>
        </div>

        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
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
                <SelectItem value="DRAFT">Draft</SelectItem>
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
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Submission
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Create New Submission</DialogTitle>
                <DialogDescription>
                  Create a new announcement, event, or record for approval
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ANNOUNCEMENT">
                          <div className="flex items-center space-x-2">
                            <Bell className="h-4 w-4" />
                            <span>Announcement</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="EVENT">
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Event</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ATTENDANCE">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4" />
                            <span>Attendance</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="PERFORMANCE">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4" />
                            <span>Performance</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="targetAudience">Target Audience</Label>
                    <Select value={formData.targetAudience} onValueChange={(value) => setFormData(prev => ({ ...prev, targetAudience: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select audience" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">Everyone</SelectItem>
                        <SelectItem value="TEACHERS">Teachers Only</SelectItem>
                        <SelectItem value="PARENTS">Parents Only</SelectItem>
                        <SelectItem value="SPECIFIC_CLASS">Specific Class</SelectItem>
                        <SelectItem value="SPECIFIC_STUDENT">Specific Student</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {(formData.targetAudience === 'SPECIFIC_CLASS' || formData.targetAudience === 'SPECIFIC_STUDENT') && (
                  <div className="space-y-2">
                    <Label htmlFor="targetId">Target</Label>
                    <Select value={formData.targetId} onValueChange={(value) => setFormData(prev => ({ ...prev, targetId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.targetAudience === 'SPECIFIC_CLASS' && classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    placeholder="Enter content"
                    rows={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button variant="secondary" onClick={() => handleSubmitSubmission(false)}>Save as Draft</Button>
                <Button onClick={() => handleSubmitSubmission(true)}>Submit for Approval</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Draft Submissions Section */}
        {draftSubmissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-gray-600">Draft Submissions ({draftSubmissions.length})</CardTitle>
              <CardDescription>
                Submissions that haven't been submitted for approval yet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Target Audience</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {draftSubmissions.map((submission) => (
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
                            onClick={() => handleSubmitForApproval(submission.id)}
                          >
                            <Send className="h-4 w-4 mr-1" />
                            Submit
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
              Complete history of all your submissions
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
                    <TableHead>Status</TableHead>
                    <TableHead>Target Audience</TableHead>
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
                        {getStatusBadge(submission.status)}
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
                          {submission.status === 'DRAFT' && (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleSubmitForApproval(submission.id)}
                            >
                              <Send className="h-4 w-4 mr-1" />
                              Submit
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
                    <label className="text-sm font-medium text-gray-500">Target Audience</label>
                    <p className="text-sm mt-1">{getTargetAudienceText(selectedSubmission.targetAudience)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Submitted At</label>
                    <p className="text-sm mt-1">{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                  </div>
                </div>
                
                {selectedSubmission.reviewedAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Reviewed At</label>
                    <p className="text-sm mt-1">{new Date(selectedSubmission.reviewedAt).toLocaleString()}</p>
                  </div>
                )}
                
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
              {selectedSubmission?.status === 'DRAFT' && (
                <Button
                  onClick={() => {
                    setIsDetailsDialogOpen(false)
                    handleSubmitForApproval(selectedSubmission.id)
                  }}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Submit for Approval
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}