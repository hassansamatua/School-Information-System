import { getServerSession } from 'next-auth'
import { authOptions } from './nextauth-simple'
import { executeQuery } from './mysql'

export type Role = 'ADMIN' | 'TEACHER' | 'PARENT'

export interface SessionContext {
  userId: string
  email: string
  role: Role
  name: string
  // Role-scoped profile ids
  adminId?: string
  teacherId?: string
  parentId?: string
}

export class AuthError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

/**
 * Returns the current session context including the role-scoped profile id
 * (adminId / teacherId / parentId). Throws AuthError if not authenticated
 * or if the role does not match.
 */
export async function requireRole(allowed: Role | Role[]): Promise<SessionContext> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new AuthError('Unauthorized', 401)
  }

  const role = (session.user as any).role as Role
  const list = Array.isArray(allowed) ? allowed : [allowed]
  if (!list.includes(role)) {
    throw new AuthError('Forbidden', 403)
  }

  const ctx: SessionContext = {
    userId: session.user.id,
    email: session.user.email || '',
    role,
    name: session.user.name || '',
  }

  if (role === 'ADMIN') {
    const rows = await executeQuery<{ id: string }>(
      'SELECT id FROM admins WHERE userId = ? LIMIT 1',
      [ctx.userId]
    )
    ctx.adminId = rows[0]?.id
  } else if (role === 'TEACHER') {
    const rows = await executeQuery<{ id: string }>(
      'SELECT id FROM teachers WHERE userId = ? LIMIT 1',
      [ctx.userId]
    )
    ctx.teacherId = rows[0]?.id
  } else if (role === 'PARENT') {
    const rows = await executeQuery<{ id: string }>(
      'SELECT id FROM parents WHERE userId = ? LIMIT 1',
      [ctx.userId]
    )
    ctx.parentId = rows[0]?.id
  }

  return ctx
}

/**
 * Returns the current session context regardless of role. Throws if unauthenticated.
 */
export async function requireSession(): Promise<SessionContext> {
  return requireRole(['ADMIN', 'TEACHER', 'PARENT'])
}
