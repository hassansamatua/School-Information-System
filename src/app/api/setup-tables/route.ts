import { NextResponse } from 'next/server'
import { executeQuery } from '@/lib/mysql'

export async function POST() {
  try {
    // Create announcements table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS announcements (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type ENUM('GENERAL', 'URGENT', 'ACADEMIC', 'EVENT', 'POLICY') NOT NULL,
        targetAudience ENUM('ALL', 'TEACHERS', 'PARENTS', 'SPECIFIC_CLASS', 'SPECIFIC_STUDENT', 'SPECIFIC') NOT NULL,
        targetId VARCHAR(36) NULL,
        status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
        attachments JSON NULL,
        publishedAt DATETIME NULL,
        expiresAt DATETIME NULL,
        rejectionReason TEXT NULL,
        postedBy VARCHAR(36) NULL,
        approvedBy VARCHAR(36) NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_targetAudience (targetAudience),
        INDEX idx_postedBy (postedBy),
        INDEX idx_publishedAt (publishedAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    // Create events table
    await executeQuery(`
      CREATE TABLE IF NOT EXISTS events (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        type ENUM('GENERAL', 'ACADEMIC', 'SPORTS', 'CULTURAL', 'MEETING', 'HOLIDAY') NOT NULL,
        targetAudience ENUM('ALL', 'TEACHERS', 'PARENTS', 'SPECIFIC_CLASS', 'SPECIFIC_STUDENT', 'SPECIFIC') NOT NULL,
        targetId VARCHAR(36) NULL,
        status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') NOT NULL DEFAULT 'DRAFT',
        attachments JSON NULL,
        eventDate DATE NOT NULL,
        eventTime TIME NULL,
        venue VARCHAR(255) NULL,
        postedBy VARCHAR(36) NULL,
        approvedBy VARCHAR(36) NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_targetAudience (targetAudience),
        INDEX idx_eventDate (eventDate),
        INDEX idx_postedBy (postedBy)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `)

    return NextResponse.json({ 
      success: true, 
      message: 'Announcements and events tables created successfully' 
    })
  } catch (error) {
    console.error('Error creating tables:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}
