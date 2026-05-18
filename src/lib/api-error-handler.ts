import { NextResponse } from 'next/server'

export class ApiErrorHandler {
  static handleApiError(error: unknown, context: string = 'API'): NextResponse {
    console.error(`Error in ${context}:`, error)
    
    // Always return JSON, never HTML
    if (error instanceof Error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        context,
        timestamp: new Date().toISOString(),
      }, { status: 500 })
    }
    
    // Handle Prisma errors specifically
    if (error && typeof error === 'object' && 'code' in error) {
      const prismaError = error as any
      return NextResponse.json({
        success: false,
        error: 'Database error',
        code: prismaError.code,
        message: prismaError.message,
        context,
        timestamp: new Date().toISOString(),
      }, { status: 500 })
    }
    
    // Fallback for unknown errors
    return NextResponse.json({
      success: false,
      error: 'Unknown error occurred',
      context,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
  
  static handleValidationError(message: string, context: string = 'API'): NextResponse {
    return NextResponse.json({
      success: false,
      error: message,
      context,
      timestamp: new Date().toISOString(),
    }, { status: 400 })
  }
  
  static handleNotFound(resource: string, context: string = 'API'): NextResponse {
    return NextResponse.json({
      success: false,
      error: `${resource} not found`,
      context,
      timestamp: new Date().toISOString(),
    }, { status: 404 })
  }
  
  static handleSuccess<T>(data: T, message?: string): NextResponse {
    return NextResponse.json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    })
  }
  
  static handleCreated<T>(data: T, message?: string): NextResponse {
    return NextResponse.json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    }, { status: 201 })
  }
}