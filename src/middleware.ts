import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = [
    '/login', 
    '/register', 
    '/api/auth/login', 
    '/api/auth/register',
    '/api/auth/signin',
    '/api/auth/signout',
    '/api/auth/session',
    '/api/auth/providers',
    '/api/auth/callback',
    '/api/auth/csrf',
    '/setup'
  ]
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // If accessing a public route, allow access
  if (isPublicRoute) {
    // If user is already logged in and trying to access login/register, redirect to dashboard
    if (token && (pathname === '/login' || pathname === '/register')) {
      const redirectUrl = getDashboardUrl(token.role as string)
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
    return NextResponse.next()
  }

  // If not authenticated, redirect to login
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Role-based route protection
  const role = token.role as string
  const protectedRoutes = {
    ADMIN: ['/admin', '/api/admin'],
    TEACHER: ['/teacher', '/api/teacher'],
    PARENT: ['/parent', '/api/parent'],
  }

  // Check if user has access to the requested route
  const hasAccess = Object.entries(protectedRoutes).some(([userRole, routes]) => {
    if (userRole === role) {
      return routes.some(route => pathname.startsWith(route))
    }
    return false
  })

  if (!hasAccess) {
    // If user doesn't have access to this route, redirect to their appropriate dashboard
    const dashboardUrl = getDashboardUrl(role)
    return NextResponse.redirect(new URL(dashboardUrl, request.url))
  }

  // Add security headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')

  return response
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

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}