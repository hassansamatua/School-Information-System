import { v4 as uuid } from 'uuid'
import { executeQuery } from './mysql'

export type NotificationType = 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS'

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = 'INFO'
): Promise<void> {
  await executeQuery(
    `INSERT INTO notifications (id, title, message, type, userId, isRead)
     VALUES (?, ?, ?, ?, ?, 0)`,
    [uuid(), title, message, type, userId]
  )
}
