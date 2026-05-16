'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useAuth(requiredRole?: string) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading

    if (!session) {
      router.push('/login')
      return
    }

    if (requiredRole && session.user.role !== requiredRole) {
      // Redirect to appropriate dashboard based on role
      const dashboardUrl = getDashboardUrl(session.user.role)
      router.push(dashboardUrl)
      return
    }
  }, [session, status, requiredRole, router])

  return {
    user: session?.user,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    role: session?.user.role,
  }
}

function getDashboardUrl(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '/admin'
    case 'TEACHER':
      return '/teacher'
    case 'PARENT':
      return '/parent'
    default:
      return '/login'
  }
}

export function useRequireAuth(requiredRole?: string) {
  const auth = useAuth(requiredRole)

  if (auth.isLoading) {
    return { ...auth, isAuthorized: false }
  }

  if (!auth.isAuthenticated) {
    return { ...auth, isAuthorized: false }
  }

  if (requiredRole && auth.role !== requiredRole) {
    return { ...auth, isAuthorized: false }
  }

  return { ...auth, isAuthorized: true }
}