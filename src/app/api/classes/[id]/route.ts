import { NextRequest, NextResponse } from 'next/server'
import { executeQuery, testConnection } from '@/lib/mysql'
import { ApiErrorHandler } from '@/lib/api-error-handler'

// PUT update class
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isConnected = await testConnection()
    
    if (!isConnected) {
      return ApiErrorHandler.handleValidationError('Database unavailable - Cannot update class when database is not connected', 'updating class')
    }
    
    const body = await request.json()
    const { name, form, stream, maxStudents, teacherId } = body
    const { id } = params

    // Validate required fields
    if (!form || !stream || !maxStudents) {
      return ApiErrorHandler.handleValidationError('Form, stream, and max students are required', 'updating class')
    }

    // Check if class exists
    const existingClass = await executeQuery(
      'SELECT id FROM classes WHERE id = ?',
      [id]
    )

    if (existingClass.length === 0) {
      return ApiErrorHandler.handleNotFoundError('Class not found', 'updating class')
    }

    // Check if another class with same form and stream already exists
    const duplicateClass = await executeQuery(
      'SELECT id FROM classes WHERE form = ? AND stream = ? AND id != ?',
      [form, stream, id]
    )

    if (duplicateClass.length > 0) {
      return ApiErrorHandler.handleValidationError(`Form ${form}${stream} already exists`, 'updating class')
    }

    // Generate class name if not provided
    const className = name || `Form ${form}${stream}`

    // Update class
    await executeQuery(
      'UPDATE classes SET name = ?, form = ?, stream = ?, maxStudents = ?, teacherId = ? WHERE id = ?',
      [className, form, stream, maxStudents, teacherId || null, id]
    )

    // Get the updated class with teacher information
    const updatedClass = await executeQuery(`
      SELECT 
        c.id,
        c.name,
        c.form,
        c.stream,
        c.maxStudents,
        c.currentStudents,
        c.isActive,
        c.teacherId,
        c.createdAt,
        c.updatedAt,
        CONCAT(t.firstName, ' ', t.lastName) as teacherName,
        u.email as teacherEmail,
        (SELECT COUNT(*) FROM students s WHERE s.classId = c.id) as studentCount
      FROM classes c
      LEFT JOIN teachers t ON c.teacherId = t.id
      LEFT JOIN users u ON t.userId = u.id
      WHERE c.id = ?
    `, [id])

    if (updatedClass.length === 0) {
      return ApiErrorHandler.handleApiError(new Error('Failed to retrieve updated class'), 'updating class')
    }

    // Transform the response
    const transformedClass = {
      id: updatedClass[0].id,
      name: updatedClass[0].name,
      form: updatedClass[0].form,
      stream: updatedClass[0].stream,
      maxStudents: updatedClass[0].maxStudents,
      currentStudents: updatedClass[0].studentCount || 0,
      isActive: updatedClass[0].isActive,
      teacherId: updatedClass[0].teacherId,
      teacherName: updatedClass[0].teacherName,
      createdAt: updatedClass[0].createdAt,
      updatedAt: updatedClass[0].updatedAt,
    }

    return ApiErrorHandler.handleSuccess(transformedClass, 'Class updated successfully')
  } catch (error) {
    return ApiErrorHandler.handleApiError(error, 'updating class')
  }
}

// DELETE class
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const isConnected = await testConnection()
    
    if (!isConnected) {
      return ApiErrorHandler.handleValidationError('Database unavailable - Cannot delete class when database is not connected', 'deleting class')
    }
    
    const { id } = params

    // Check if class exists
    const existingClass = await executeQuery(
      'SELECT id, name FROM classes WHERE id = ?',
      [id]
    )

    if (existingClass.length === 0) {
      return ApiErrorHandler.handleNotFoundError('Class not found', 'deleting class')
    }

    // Check if class has students
    const studentsCount = await executeQuery(
      'SELECT COUNT(*) as count FROM students WHERE classId = ?',
      [id]
    )

    if (studentsCount[0].count > 0) {
      return ApiErrorHandler.handleValidationError('Cannot delete class with enrolled students', 'deleting class')
    }

    // Delete class
    await executeQuery(
      'DELETE FROM classes WHERE id = ?',
      [id]
    )

    return ApiErrorHandler.handleSuccess(null, 'Class deleted successfully')
  } catch (error) {
    return ApiErrorHandler.handleApiError(error, 'deleting class')
  }
}