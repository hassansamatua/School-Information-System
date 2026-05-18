import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export async function GET() {
  try {
    const prisma = new PrismaClient({
      log: ['error', 'info', 'query'],
    })
    
    // Test database connection
    await prisma.$connect()
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    // Test class count
    const classCount = await prisma.class.count()
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      testResult: result,
      classCount: classCount,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Database test error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown database error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}