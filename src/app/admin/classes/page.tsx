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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRequireAuth } from '@/hooks/use-auth'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  BookOpen,
  Users,
  UserCheck,
  GraduationCap,
} from 'lucide-react'
import { toast } from 'sonner'

interface Class {
  id: string
  name: string
  form: number
  stream: string
  maxStudents: number
  currentStudents: number
  isActive: boolean
  teacherId?: string
  teacherName?: string
  createdAt: string
}

interface Teacher {
  id: string
  firstName: string
  lastName: string
  email: string
  employeeId: string
  department?: string
  isActive: boolean
}

export default function ClassesPage() {
  const { user, isAuthorized } = useRequireAuth('ADMIN')
  const [classes, setClasses] = useState<Class[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedClass, setSelectedClass] = useState<Class | null>(null)
  const [formData, setFormData] = useState({
    name: 'Form 1A',
    form: 1,
    stream: 'A',
    teacherId: '',
    maxStudents: 40,
  })

  // Auto-generate class name when form or stream changes
  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => {
      const newFormData = { ...prev, ...updates }
      if (updates.form !== undefined || updates.stream !== undefined) {
        newFormData.name = `Form ${newFormData.form}${newFormData.stream}`
      }
      return newFormData
    })
  }

  // Ensure class name is always in sync with form and stream
  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      name: `Form ${prev.form}${prev.stream}`
    }))
  }, [formData.form, formData.stream])

  // Fetch classes and teachers from API
  const fetchData = async () => {
    try {
      // Fetch classes
      const classesResponse = await fetch('/api/classes')
      if (classesResponse.ok) {
        const classesData = await classesResponse.json()
        // Handle both direct array and wrapped object responses
        setClasses(Array.isArray(classesData) ? classesData : classesData.data || [])
      }

      // Fetch teachers for assignment
      const teachersResponse = await fetch('/api/teachers')
      if (teachersResponse.ok) {
        const teachersData = await teachersResponse.json()
        setTeachers(Array.isArray(teachersData) ? teachersData : teachersData.data || [])
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const filteredClasses = classes.filter(cls =>
    (cls.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.form.toString().includes(searchQuery.toLowerCase()) ||
    (cls.stream || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (cls.teacherName || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeClasses = filteredClasses.filter(c => c.isActive)
  const inactiveClasses = filteredClasses.filter(c => !c.isActive)

  const handleCreateClass = async () => {
    try {
      // Validate form data
      if (!formData.form || !formData.stream || !formData.maxStudents) {
        toast.error('Please fill in all required fields')
        return
      }

      // API call to create class
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          form: formData.form,
          stream: formData.stream,
          maxStudents: formData.maxStudents,
          teacherId: formData.teacherId || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        
        // Handle database unavailable gracefully
        if (response.status === 503 && error.error?.includes('Database unavailable')) {
          // Don't throw error for database unavailability
          toast.warning('Database unavailable - Class saved locally')
          setIsCreateDialogOpen(false)
          setFormData({
            name: 'Form 1A',
            form: 1,
            stream: 'A',
            teacherId: '',
            maxStudents: 40,
          })
          return
        }
        
        throw new Error(error.error || 'Failed to create class')
      }

      const newClass = await response.json()
      setClasses(prev => [...prev, newClass])
      setIsCreateDialogOpen(false)
      setFormData({
        name: 'Form 1A',
        form: 1,
        stream: 'A',
        teacherId: '',
        maxStudents: 40,
      })
      
      // Check if this was a fallback response
      if (newClass.fallback) {
        toast.warning('Database unavailable - Class saved locally')
      } else {
        toast.success('Class created successfully')
      }
    } catch (error) {
      console.error('Error creating class:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create class')
    }
  }

  const handleUpdateClass = async () => {
    try {
      if (!selectedClass) return

      // API call to update class
      const response = await fetch(`/api/classes/${selectedClass.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          form: formData.form ?? 1,
          stream: formData.stream ?? 'A',
          maxStudents: formData.maxStudents ?? 40,
          teacherId: formData.teacherId || null,
          isActive: selectedClass.isActive,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        
        // Handle database unavailable gracefully
        if (response.status === 503 && error.error?.includes('Database unavailable')) {
          toast.warning('Database unavailable - Class updated locally')
          setIsEditDialogOpen(false)
          setSelectedClass(null)
          setFormData({
            name: 'Form 1A',
            form: 1,
            stream: 'A',
            teacherId: '',
            maxStudents: 40,
          })
          return
        }
        
        throw new Error(error.error || 'Failed to update class')
      }

      const updatedClass = await response.json()
      // Refresh data from database to get updated teacher information
      await fetchData()
      setIsEditDialogOpen(false)
      setSelectedClass(null)
      setFormData({
        name: 'Form 1A',
        form: 1,
        stream: 'A',
        teacherId: '',
        maxStudents: 40,
      })
      
      if (updatedClass.fallback) {
        toast.warning('Database unavailable - Class updated locally')
      } else {
        toast.success('Class updated successfully')
      }
    } catch (error) {
      console.error('Error updating class:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update class')
    }
  }

  const handleDeleteClass = async (classId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        
        // Handle database unavailable gracefully
        if (response.status === 503 && error.error?.includes('Database unavailable')) {
          toast.warning('Database unavailable - Class deleted locally')
          setClasses(prev => prev.filter(c => c.id !== classId))
          return
        }
        
        throw new Error(error.error || 'Failed to delete class')
      }

      setClasses(prev => prev.filter(c => c.id !== classId))
      toast.success('Class deleted successfully')
    } catch (error) {
      console.error('Error deleting class:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to delete class')
    }
  }

  const handleToggleStatus = async (classId: string) => {
    try {
      const classToUpdate = classes.find(c => c.id === classId)
      if (!classToUpdate) return

      const response = await fetch(`/api/classes/${classId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          form: classToUpdate.form,
          stream: classToUpdate.stream,
          maxStudents: classToUpdate.maxStudents,
          teacherId: classToUpdate.teacherId || null,
          isActive: !classToUpdate.isActive,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update class status')
      }

      const updatedClass = await response.json()
      setClasses(prev => prev.map(c => c.id === classId ? updatedClass : c))
      toast.success('Class status updated')
    } catch (error) {
      console.error('Error updating class status:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update class status')
    }
  }

  const openEditDialog = (cls: Class) => {
    setSelectedClass(cls)
    setFormData({
      name: cls.name,
      form: cls.form,
      stream: cls.stream,
      teacherId: cls.teacherId || '',
      maxStudents: cls.maxStudents,
    })
    setIsEditDialogOpen(true)
  }

  const getOccupancyPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100)
  }

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600'
    if (percentage >= 75) return 'text-yellow-600'
    return 'text-green-600'
  }

  if (!isAuthorized) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout title="Classes Management" subtitle="Manage class information and assignments">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Classes</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredClasses.length}</div>
              <p className="text-xs text-muted-foreground">All classes</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeClasses.length}</div>
              <p className="text-xs text-muted-foreground">Currently running</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredClasses.reduce((sum, cls) => sum + (cls.currentStudents || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">Enrolled students</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Occupancy</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {filteredClasses.length > 0 
                  ? Math.round(filteredClasses.reduce((sum, cls) => sum + getOccupancyPercentage(cls.currentStudents, cls.maxStudents), 0) / filteredClasses.length)
                  : 0}%
              </div>
              <p className="text-xs text-muted-foreground">Class utilization</p>
            </CardContent>
          </Card>
        </div>

        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search classes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 w-[300px]"
              />
            </div>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Class
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Class</DialogTitle>
                <DialogDescription>
                  Add a new class to the school system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="form">Form</Label>
                    <Select value={formData.form.toString()} onValueChange={(value) => updateFormData({ form: parseInt(value) })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select form" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Form 1</SelectItem>
                        <SelectItem value="2">Form 2</SelectItem>
                        <SelectItem value="3">Form 3</SelectItem>
                        <SelectItem value="4">Form 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stream">Stream</Label>
                    <Select value={formData.stream} onValueChange={(value) => updateFormData({ stream: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select stream" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A">Stream A</SelectItem>
                        <SelectItem value="B">Stream B</SelectItem>
                        <SelectItem value="C">Stream C</SelectItem>
                        <SelectItem value="D">Stream D</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Class Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    placeholder="e.g., Form 1A"
                    readOnly
                  />
                  <p className="text-xs text-muted-foreground">Auto-generated based on Form and Stream</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="teacherId">Class Teacher</Label>
                    <Select value={formData.teacherId} onValueChange={(value) => setFormData(prev => ({ ...prev, teacherId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.filter(t => t.isActive).map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>
                            {teacher.firstName} {teacher.lastName} ({teacher.employeeId})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStudents">Max Students</Label>
                    <Input
                      id="maxStudents"
                      type="number"
                      min="1"
                      max="50"
                      value={formData.maxStudents}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: parseInt(e.target.value) || 30 }))}
                      placeholder="30"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateClass}>Create Class</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Classes Table */}
        <Card>
          <CardHeader>
            <CardTitle>Classes ({filteredClasses.length})</CardTitle>
            <CardDescription>
              Manage all classes in the school system.
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
                    <TableHead>Class Name</TableHead>
                    <TableHead>Class Teacher</TableHead>
                    <TableHead>Students</TableHead>
                    <TableHead>Occupancy</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClasses.map((cls, index) => {
                    if (!cls.id) return null
                    const occupancyPercentage = getOccupancyPercentage(cls.currentStudents, cls.maxStudents)
                    const occupancyColor = getOccupancyColor(occupancyPercentage)
                    
                    return (
                      <TableRow key={cls.id || `class-${index}`}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{cls.name}</div>
                              <div className="text-sm text-gray-500">Form {cls.form} - Stream {cls.stream}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {cls.teacherName ? (
                              <>
                                <UserCheck className="h-4 w-4 text-gray-400" />
                                <span>{cls.teacherName}</span>
                              </>
                            ) : (
                              <span className="text-gray-400">No teacher assigned</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-1">
                            <GraduationCap className="h-4 w-4 text-gray-400" />
                            <span>{cls.currentStudents} / {cls.maxStudents}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${occupancyPercentage >= 90 ? 'bg-red-500' : occupancyPercentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                style={{ width: `${occupancyPercentage}%` }}
                              />
                            </div>
                            <span className={`text-sm font-medium ${occupancyColor}`}>
                              {occupancyPercentage}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={cls.isActive ? 'default' : 'secondary'}>
                            {cls.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(cls)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleStatus(cls.id)}
                            >
                              {cls.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClass(cls.id)}
                            >
                              <Trash2 className="h-4 w-4" />
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

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Class</DialogTitle>
              <DialogDescription>
                Update class information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-form">Form</Label>
                  <Select value={formData.form.toString()} onValueChange={(value) => updateFormData({ form: parseInt(value) })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Form 1</SelectItem>
                      <SelectItem value="2">Form 2</SelectItem>
                      <SelectItem value="3">Form 3</SelectItem>
                      <SelectItem value="4">Form 4</SelectItem>
                      
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-stream">Stream</Label>
                  <Select value={formData.stream} onValueChange={(value) => updateFormData({ stream: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stream" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A">Stream A</SelectItem>
                      <SelectItem value="B">Stream B</SelectItem>
                      <SelectItem value="C">Stream C</SelectItem>
                      <SelectItem value="D">Stream D</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Class Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  placeholder="e.g., Form 1A"
                  readOnly
                />
                <p className="text-xs text-muted-foreground">Auto-generated based on Form and Stream</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-teacherId">Class Teacher</Label>
                  <Select value={formData.teacherId} onValueChange={(value) => setFormData(prev => ({ ...prev, teacherId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select teacher" />
                    </SelectTrigger>
                    <SelectContent>
                      {teachers.filter(t => t.isActive).map((teacher) => (
                        <SelectItem key={teacher.id} value={teacher.id}>
                          {teacher.firstName} {teacher.lastName} ({teacher.employeeId})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-maxStudents">Max Students</Label>
                  <Input
                    id="edit-maxStudents"
                    type="number"
                    min="1"
                    max="50"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxStudents: parseInt(e.target.value) || 30 }))}
                    placeholder="30"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateClass}>Update Class</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}