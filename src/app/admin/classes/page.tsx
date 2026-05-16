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
  grade: string
  section?: string
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
    name: '',
    grade: '',
    section: '',
    teacherId: '',
    maxStudents: 30,
  })

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockClasses: Class[] = [
      {
        id: '1',
        name: 'Grade 5-A',
        grade: '5',
        section: 'A',
        maxStudents: 30,
        currentStudents: 25,
        isActive: true,
        teacherId: '1',
        teacherName: 'John Smith',
        createdAt: '2024-01-15',
      },
      {
        id: '2',
        name: 'Grade 6-B',
        grade: '6',
        section: 'B',
        maxStudents: 30,
        currentStudents: 28,
        isActive: true,
        teacherId: '2',
        teacherName: 'Sarah Johnson',
        createdAt: '2024-01-20',
      },
      {
        id: '3',
        name: 'Grade 4-C',
        grade: '4',
        section: 'C',
        maxStudents: 25,
        currentStudents: 20,
        isActive: false,
        teacherId: '3',
        teacherName: 'Michael Brown',
        createdAt: '2024-02-01',
      },
    ]

    const mockTeachers: Teacher[] = [
      {
        id: '1',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@school.edu',
        employeeId: 'T001',
        department: 'Mathematics',
        isActive: true,
      },
      {
        id: '2',
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@school.edu',
        employeeId: 'T002',
        department: 'Science',
        isActive: true,
      },
      {
        id: '3',
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@school.edu',
        employeeId: 'T003',
        department: 'English',
        isActive: true,
      },
    ]
    
    setTimeout(() => {
      setClasses(mockClasses)
      setTeachers(mockTeachers)
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredClasses = classes.filter(cls =>
    cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.grade.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.section?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cls.teacherName?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeClasses = filteredClasses.filter(c => c.isActive)
  const inactiveClasses = filteredClasses.filter(c => !c.isActive)

  const handleCreateClass = async () => {
    try {
      // Validate form data
      if (!formData.name || !formData.grade || !formData.maxStudents) {
        toast.error('Please fill in all required fields')
        return
      }

      // Mock API call
      const newClass: Class = {
        id: Date.now().toString(),
        name: formData.name,
        grade: formData.grade,
        section: formData.section,
        maxStudents: formData.maxStudents,
        currentStudents: 0,
        isActive: true,
        teacherId: formData.teacherId || undefined,
        teacherName: teachers.find(t => t.id === formData.teacherId) ? 
          `${teachers.find(t => t.id === formData.teacherId)?.firstName} ${teachers.find(t => t.id === formData.teacherId)?.lastName}` : 
          undefined,
        createdAt: new Date().toISOString(),
      }

      setClasses(prev => [...prev, newClass])
      setIsCreateDialogOpen(false)
      setFormData({
        name: '',
        grade: '',
        section: '',
        teacherId: '',
        maxStudents: 30,
      })
      toast.success('Class created successfully')
    } catch (error) {
      toast.error('Failed to create class')
    }
  }

  const handleUpdateClass = async () => {
    try {
      if (!selectedClass) return

      // Mock API call
      const updatedClass = {
        ...selectedClass,
        name: formData.name,
        grade: formData.grade,
        section: formData.section,
        teacherId: formData.teacherId || undefined,
        teacherName: teachers.find(t => t.id === formData.teacherId) ? 
          `${teachers.find(t => t.id === formData.teacherId)?.firstName} ${teachers.find(t => t.id === formData.teacherId)?.lastName}` : 
          undefined,
        maxStudents: formData.maxStudents,
      }

      setClasses(prev => prev.map(c => c.id === selectedClass.id ? updatedClass : c))
      setIsEditDialogOpen(false)
      setSelectedClass(null)
      setFormData({
        name: '',
        grade: '',
        section: '',
        teacherId: '',
        maxStudents: 30,
      })
      toast.success('Class updated successfully')
    } catch (error) {
      toast.error('Failed to update class')
    }
  }

  const handleDeleteClass = async (classId: string) => {
    try {
      setClasses(prev => prev.filter(c => c.id !== classId))
      toast.success('Class deleted successfully')
    } catch (error) {
      toast.error('Failed to delete class')
    }
  }

  const handleToggleStatus = async (classId: string) => {
    try {
      setClasses(prev => prev.map(c => 
        c.id === classId ? { ...c, isActive: !c.isActive } : c
      ))
      toast.success('Class status updated')
    } catch (error) {
      toast.error('Failed to update class status')
    }
  }

  const openEditDialog = (cls: Class) => {
    setSelectedClass(cls)
    setFormData({
      name: cls.name,
      grade: cls.grade,
      section: cls.section || '',
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
                {filteredClasses.reduce((sum, cls) => sum + cls.currentStudents, 0)}
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
                    <Label htmlFor="grade">Grade</Label>
                    <Select value={formData.grade} onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Grade 1</SelectItem>
                        <SelectItem value="2">Grade 2</SelectItem>
                        <SelectItem value="3">Grade 3</SelectItem>
                        <SelectItem value="4">Grade 4</SelectItem>
                        <SelectItem value="5">Grade 5</SelectItem>
                        <SelectItem value="6">Grade 6</SelectItem>
                        <SelectItem value="7">Grade 7</SelectItem>
                        <SelectItem value="8">Grade 8</SelectItem>
                        <SelectItem value="9">Grade 9</SelectItem>
                        <SelectItem value="10">Grade 10</SelectItem>
                        <SelectItem value="11">Grade 11</SelectItem>
                        <SelectItem value="12">Grade 12</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="section">Section</Label>
                    <Input
                      id="section"
                      value={formData.section}
                      onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                      placeholder="A, B, C..."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Class Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Grade 5-A"
                  />
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
                  {filteredClasses.map((cls) => {
                    const occupancyPercentage = getOccupancyPercentage(cls.currentStudents, cls.maxStudents)
                    const occupancyColor = getOccupancyColor(occupancyPercentage)
                    
                    return (
                      <TableRow key={cls.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium">{cls.name}</div>
                              <div className="text-sm text-gray-500">Grade {cls.grade}</div>
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
                  <Label htmlFor="edit-grade">Grade</Label>
                  <Select value={formData.grade} onValueChange={(value) => setFormData(prev => ({ ...prev, grade: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select grade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Grade 1</SelectItem>
                      <SelectItem value="2">Grade 2</SelectItem>
                      <SelectItem value="3">Grade 3</SelectItem>
                      <SelectItem value="4">Grade 4</SelectItem>
                      <SelectItem value="5">Grade 5</SelectItem>
                      <SelectItem value="6">Grade 6</SelectItem>
                      <SelectItem value="7">Grade 7</SelectItem>
                      <SelectItem value="8">Grade 8</SelectItem>
                      <SelectItem value="9">Grade 9</SelectItem>
                      <SelectItem value="10">Grade 10</SelectItem>
                      <SelectItem value="11">Grade 11</SelectItem>
                      <SelectItem value="12">Grade 12</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-section">Section</Label>
                  <Input
                    id="edit-section"
                    value={formData.section}
                    onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                    placeholder="A, B, C..."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Class Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Grade 5-A"
                />
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