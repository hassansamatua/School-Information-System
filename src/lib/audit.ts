import { v4 as uuid } from 'uuid'
import { executeQuery } from './mysql'

export type AuditAction = 
  | 'CREATE' 
  | 'UPDATE' 
  | 'DELETE' 
  | 'APPROVE' 
  | 'REJECT' 
  | 'LOGIN' 
  | 'LOGOUT'
  | 'VIEW'

export type AuditEntityType = 
  | 'USER' 
  | 'STUDENT' 
  | 'TEACHER' 
  | 'PARENT' 
  | 'CLASS' 
  | 'ATTENDANCE' 
  | 'PERFORMANCE' 
  | 'RESULT' 
  | 'SUBMISSION' 
  | 'APPROVAL' 
  | 'ANNOUNCEMENT' 
  | 'EVENT' 
  | 'NOTIFICATION'

export async function createAuditLog(
  userId: string,
  action: AuditAction,
  entityType: AuditEntityType,
  entityId: string,
  details?: string
): Promise<void> {
  try {
    await executeQuery(
      `INSERT INTO auditLogs (id, userId, action, entityType, entityId, details, ipAddress)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uuid(), userId, action, entityType, entityId, details || null, null]
    )
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw - audit log failures shouldn't break the main operation
  }
}

export async function getAuditLogs(filters?: {
  userId?: string
  action?: AuditAction
  entityType?: AuditEntityType
  entityId?: string
  limit?: number
  offset?: number
}) {
  const where: string[] = []
  const params: any[] = []

  if (filters?.userId) { where.push('userId = ?'); params.push(filters.userId) }
  if (filters?.action) { where.push('action = ?'); params.push(filters.action) }
  if (filters?.entityType) { where.push('entityType = ?'); params.push(filters.entityType) }
  if (filters?.entityId) { where.push('entityId = ?'); params.push(filters.entityId) }

  const whereClause = where.length ? 'WHERE ' + where.join(' AND ') : ''
  const limit = filters?.limit || 100
  const offset = filters?.offset || 0

  const rows = await executeQuery<any>(
    `SELECT * FROM auditLogs ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  )

  return rows.map((r: any) => ({
    id: r.id,
    userId: r.userId,
    action: r.action,
    entityType: r.entityType,
    entityId: r.entityId,
    details: r.details,
    ipAddress: r.ipAddress,
    createdAt: r.createdAt,
  }))
}
