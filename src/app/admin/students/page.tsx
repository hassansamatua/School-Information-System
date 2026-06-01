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
  Users,
  Mail,
  Phone,
  GraduationCap,
  Calendar,
  MapPin,
  UserCheck,
} from 'lucide-react'
import { toast } from 'sonner'

interface Student {
  id: string
  registrationNumber: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  dateOfBirth: string
  gender: 'MALE' | 'FEMALE'
  address?: string
  isActive: boolean
  classId?: string
  className?: string
  parentName?: string
  createdAt: string
}

interface Class {
  id: string
  name: string
  form: number
  stream: string
}

export default function StudentsPage() {
  const { user, isAuthorized } = useRequireAuth('ADMIN')
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [formData, setFormData] = useState({
    registrationNumber: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    classId: '',
    parentId: '',
  })

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockStudents: Student[] = [
      {
        id: '1',
        registrationNumber: 'REG2024001',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@email.com',
        phone: '+1234567890',
        dateOfBirth: '2010-05-15',
        gender: 'FEMALE',
        address: '123 Main St, City',
        isActive: true,
        classId: '1',
        className: 'Form 1A',
        parentName: 'Mary Johnson',
        createdAt: '2024-01-15',
      },
      {
        id: '2',
        registrationNumber: 'REG2024002',
        firstName: 'Bob',
        lastName: 'Smith',
        email: 'bob.smith@email.com',
        phone: '+1234567891',
        dateOfBirth: '2009-08-20',
        gender: 'MALE',
        address: '456 Oak Ave, City',
        isActive: true,
        classId: '2',
        className: 'Form 2B',
        parentName: 'David Smith',
        createdAt: '2024-01-20',
      },
      {
        id: '3',
        registrationNumber: 'REG2024003',
        firstName: 'Charlie',
        lastName: 'Brown',
        email: 'charlie.brown@email.com',
        phone: '+1234567892',
        dateOfBirth: '2011-03-10',
        gender: 'MALE',
        address: '789 Pine Rd, City',
        isActive: false,
        classId: '1',
        className: 'Form 1A',
        parentName: 'Lisa Brown',
        createdAt: '2024-02-01',
      },
      {
        id: '4',
        registrationNumber: 'REG2024004',
        firstName: 'David',
        lastName: 'Wilson',
        email: 'david.wilson@email.com',
        phone: '+1234567893',
        dateOfBirth: '2008-08-22',
        gender: 'MALE',
        address: '456 Oak Ave, City',
        isActive: true,
        classId: '7',
        className: 'Form 4A',
        parentName: 'Robert Wilson',
        createdAt: '2024-01-20',
      },
      {
        id: '5',
        registrationNumber: 'REG2024005',
        firstName: 'Emma',
        lastName: 'Davis',
        email: 'emma.davis@email.com',
        phone: '+1234567894',
        dateOfBirth: '2008-12-05',
        gender: 'FEMALE',
        address: '321 Elm St, City',
        isActive: true,
        classId: '8',
        className: 'Form 4B',
        parentName: 'Jennifer Davis',
        createdAt: '2024-02-10',
      },
    ]

    // Fetch students and classes from API
    const fetchData = async () => {
      try {
        // Fetch students
        const studentsResponse = await fetch('/api/students')
        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json()
          setStudents(Array.isArray(studentsData) ? studentsData : studentsData.data || [])
        }

        // Fetch classes for student assignment
        const classesResponse = await fetch('/api/classes')
        if (classesResponse.ok) {
          const classesData = await classesResponse.json()
          setClasses(Array.isArray(classesData) ? classesData : classesData.data || [])
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('Failed to load data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredStudents = students.filter(student => {
    const q = searchQuery.toLowerCase()
    return (
      (student.firstName?.toLowerCase().includes(q)) ||
      (student.lastName?.toLowerCase().includes(q)) ||
      (student.registrationNumber?.toLowerCase().includes(q)) ||
      (student.email?.toLowerCase().includes(q))
    )
  })

  const activeStudents = filteredStudents.filter(s => s.isActive)
  const inactiveStudents = filteredStudents.filter(s => !s.isActive)

  const handleCreateStudent = async () => {
    try {
      // Validate form data
      if (!formData.registrationNumber || !formData.firstName || !formData.lastName || !formData.dateOfBirth || !formData.gender) {
        toast.error('Please fill in all required fields')
        return
      }

      // API call to create student
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          registrationNumber: formData.registrationNumber,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email || null,
          phone: formData.phone || null,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          address: formData.address || null,
          classId: formData.classId || null,
          parentId: formData.parentId || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create student')
      }

      const created = await response.json()
      const newStudent = created.data ?? created
      setStudents(prev => [...prev, newStudent])
      setIsCreateDialogOpen(false)
      setFormData({
        registrationNumber: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        classId: '',
        parentId: '',
      })
      toast.success('Student created successfully')
    } catch (error) {
      console.error('Error creating student:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create student')
    }
  }

  const handleUpdateStudent = async () => {
    try {
      if (!selectedStudent) return

      // Mock API call
      const updatedStudent = {
        ...selectedStudent,
        registrationNumber: formData.registrationNumber,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender as 'MALE' | 'FEMALE',
        address: formData.address,
        classId: formData.classId || undefined,
        className: classes.find(c => c.id === formData.classId)?.name,
      }

      setStudents(prev => prev.map(s => s.id === selectedStudent.id ? updatedStudent : s))
      setIsEditDialogOpen(false)
      setSelectedStudent(null)
      setFormData({
        registrationNumber: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        classId: '',
        parentId: '',
      })
      toast.success('Student updated successfully')
    } catch (error) {
      toast.error('Failed to update student')
    }
  }

  const handleDeleteStudent = async (studentId: string) => {
    try {
      setStudents(prev => prev.filter(s => s.id !== studentId))
      toast.success('Student deleted successfully')
    } catch (error) {
      toast.error('Failed to delete student')
    }
  }

  const handleToggleStatus = async (studentId: string) => {
    try {
      setStudents(prev => prev.map(s => 
        s.id === studentId ? { ...s, isActive: !s.isActive } : s
      ))
      toast.success('Student status updated')
    } catch (error) {
      toast.error('Failed to update student status')
    }
  }

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student)
    setFormData({
      registrationNumber: student.registrationNumber,
      firstName: student.firstName,
      lastName: student.lastName,
      email: student.email || '',
      phone: student.phone || '',
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      address: student.address || '',
      classId: student.classId || '',
      parentId: '',
    })
    setIsEditDialogOpen(true)
  }

  if (!isAuthorized) {
    return <div>Loading...</div>
  }

  return (
    <DashboardLayout title="Students Management" subtitle="Manage student records and information">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{filteredStudents.length}</div>
              <p className="text-xs text-muted-foreground">Registered students</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Students</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{activeStudents.length}</div>
              <p className="text-xs text-muted-foreground">Currently enrolled</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Students</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{inactiveStudents.length}</div>
              <p className="text-xs text-muted-foreground">Not enrolled</p>
            </CardContent>
          </Card>
        </div>

        {/* Header with Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
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
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Create New Student</DialogTitle>
                <DialogDescription>
                  Add a new student to the school system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="registrationNumber">Registration Number</Label>
                    <Input
                      id="registrationNumber"
                      value={formData.registrationNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                      placeholder="REG2024001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                      placeholder="First name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                      placeholder="Last name"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="classId">Class</Label>
                    <Select value={formData.classId} onValueChange={(value) => setFormData(prev => ({ ...prev, classId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (Optional)</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Email address"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="Phone number"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address (Optional)</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Home address"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateStudent}>Create Student</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Students Table */}
        <Card>
          <CardHeader>
            <CardTitle>Students ({filteredStudents.length})</CardTitle>
            <CardDescription>
              Manage all student records in the school system.
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
                    <TableHead>Parent</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center space-x-2">
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
                        <Badge variant="outline">{student.className || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <UserCheck className="h-4 w-4 text-gray-400" />
                          <span>{student.parentName || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {Math.floor((new Date().getTime() - new Date(student.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} years
                      </TableCell>
                      <TableCell>
                        <Badge variant={student.isActive ? 'default' : 'secondary'}>
                          {student.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(student)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleStatus(student.id)}
                          >
                            {student.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteStudent(student.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>
                Update student information.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-registrationNumber">Registration Number</Label>
                  <Input
                    id="edit-registrationNumber"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, registrationNumber: e.target.value }))}
                    placeholder="REG2024001"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-dateOfBirth">Date of Birth</Label>
                  <Input
                    id="edit-dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-firstName">First Name</Label>
                  <Input
                    id="edit-firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-lastName">Last Name</Label>
                  <Input
                    id="edit-lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-gender">Gender</Label>
                  <Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-classId">Class</Label>
                  <Select value={formData.classId} onValueChange={(value) => setFormData(prev => ({ ...prev, classId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-email">Email (Optional)</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-phone">Phone (Optional)</Label>
                  <Input
                    id="edit-phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Phone number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-address">Address (Optional)</Label>
                <Input
                  id="edit-address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Home address"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateStudent}>Update Student</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  )
}