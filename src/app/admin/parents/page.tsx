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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useRequireAuth } from '@/hooks/use-auth'
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  UserCheck,
  Mail,
  Phone,
  Users,
  GraduationCap,
} from 'lucide-react'
import { toast } from 'sonner'

interface Parent {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  occupation?: string
  address?: string
  isApproved: boolean
  isActive?: boolean
  studentCount: number
  students?: Array<{
    id: string
    firstName: string
    lastName: string
    registrationNumber: string
    className: string | null
  }>
  createdAt: string
}

export default function ParentsPage() {
  const { user, isAuthorized } = useRequireAuth('ADMIN')
  const [parents, setParents] = useState<Parent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedParent, setSelectedParent] = useState<Parent | null>(null)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)

  const loadParents = async () => {
    try {
      const res = await fetch('/api/parents')
      if (!res.ok) throw new Error(`Failed to load (${res.status})`)
      const data = await res.json()
      setParents(data)
    } catch (e: any) {
      console.error(e)
      toast.error(e?.message || 'Failed to load parents')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!isAuthorized) return
    loadParents()
  }, [isAuthorized])

  const filteredParents = parents.filter(parent =>
    parent.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    parent.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    parent.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleApproveParent = async (parentId: string) => {
    try {
      const res = await fetch(`/api/parents/${parentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isApproved: true }),
      })
      if (!res.ok) throw new Error(`Failed to approve (${res.status})`)
      toast.success('Parent approved successfully')
      await loadParents()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to approve parent')
    }
  }

  const handleRejectParent = async (parentId: string) => {
    try {
      const res = await fetch(`/api/parents/${parentId}`, {
        method: 'DELETE',
      })
      if (!res.ok) throw new Error(`Failed to reject (${res.status})`)
      toast.success('Parent rejected and removed')
      await loadParents()
    } catch (error: any) {
      toast.error(error?.message || 'Failed to reject parent')
    }
  }

  const openDetailsDialog = (parent: Parent) => {
    setSelectedParent(parent)
    setIsDetailsDialogOpen(true)
  }

  const pendingParents = filteredParents.filter(p => !p.isApproved)
  const approvedParents = filteredParents.filter(p => p.isApproved)

  if (!isAuthorized) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout title="Parents Management" subtitle="Manage parent accounts and approvals">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Parents</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredParents.length}</div>
              <p className="text-xs text-muted-foreground">Registered parents</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingParents.length}</div>
              <p className="text-xs text-muted-foreground">Waiting for review</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Parents</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedParents.length}</div>
              <p className="text-xs text-muted-foreground">Active accounts</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search parents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
        </div>

        {/* Pending Approvals Section */}
        {pendingParents.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600">Pending Approvals ({pendingParents.length})</CardTitle>
              <CardDescription>
                Parents waiting for account approval
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Registered</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingParents.map((parent) => (
                    <TableRow key={parent.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center">
                            <UserCheck className="h-4 w-4 text-orange-600" />
                          </div>
                          <div>
                            <div className="font-medium">{parent.firstName} {parent.lastName}</div>
                            <div className="text-sm text-gray-500">{parent.occupation || 'N/A'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{parent.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{parent.phone || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <GraduationCap className="h-4 w-4 text-gray-400" />
                          <span>{parent.studentCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(parent.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetailsDialog(parent)}
                          >
                            View Details
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleApproveParent(parent.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRejectParent(parent.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
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

        {/* Approved Parents Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-green-600">Approved Parents ({approvedParents.length})</CardTitle>
            <CardDescription>
              Active parent accounts in the system
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
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Occupation</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedParents.map((parent) => (
                    <TableRow key={parent.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                            <UserCheck className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">{parent.firstName} {parent.lastName}</div>
                            <div className="text-sm text-gray-500">{parent.address || 'N/A'}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{parent.email}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{parent.phone || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{parent.occupation || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <GraduationCap className="h-4 w-4 text-gray-400" />
                          <span>{parent.studentCount || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDetailsDialog(parent)}
                          >
                            View Details
                          </Button>
                          <Badge variant="default">Active</Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Parent Details Dialog */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Parent Details</DialogTitle>
              <DialogDescription>
                Complete information about the parent account
              </DialogDescription>
            </DialogHeader>
            {selectedParent && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">First Name</label>
                    <p className="text-sm">{selectedParent.firstName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Last Name</label>
                    <p className="text-sm">{selectedParent.lastName}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-sm">{selectedParent.email}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-sm">{selectedParent.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Occupation</label>
                    <p className="text-sm">{selectedParent.occupation || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-sm">{selectedParent.address || 'N/A'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <div className="mt-1">
                      <Badge variant={selectedParent.isApproved ? 'default' : 'secondary'}>
                        {selectedParent.isApproved ? 'Approved' : 'Pending'}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Registered</label>
                    <p className="text-sm">{new Date(selectedParent.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Linked Students</label>
                  <p className="text-sm">{selectedParent.studentCount || 0} students</p>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
                Close
              </Button>
              {selectedParent && !selectedParent.isApproved && (
                <>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleRejectParent(selectedParent.id)
                      setIsDetailsDialogOpen(false)
                    }}
                  >
                    Reject
                  </Button>
                  <Button
                    onClick={() => {
                      handleApproveParent(selectedParent.id)
                      setIsDetailsDialogOpen(false)
                    }}
                  >
                    Approve
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}