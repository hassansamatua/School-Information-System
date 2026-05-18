import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { executeQuery } from './mysql'

interface DbUser {
  id: string
  email: string
  password: string
  role: 'ADMIN' | 'TEACHER' | 'PARENT'
  isActive: number | boolean
  firstName?: string | null
  lastName?: string | null
  parentApproved?: number | boolean | null
}

declare module 'next-auth' {
  interface User {
    isPendingParent?: boolean
  }
  interface Session {
    user: {
      id: string
      email: string
      role: string
      name: string
      isPendingParent?: boolean
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    isPendingParent?: boolean
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const rows = await executeQuery<DbUser>(
          `SELECT u.id, u.email, u.password, u.role, u.isActive,
                  COALESCE(a.firstName, t.firstName, p.firstName) AS firstName,
                  COALESCE(a.lastName,  t.lastName,  p.lastName)  AS lastName,
                  p.isApproved AS parentApproved
           FROM users u
           LEFT JOIN admins   a ON a.userId = u.id
           LEFT JOIN teachers t ON t.userId = u.id
           LEFT JOIN parents  p ON p.userId = u.id
           WHERE u.email = ?
           LIMIT 1`,
          [credentials.email]
        )

        const user = rows[0]
        if (!user) return null
        if (!user.isActive) return null

        // Allow unapproved parents to login but mark them as pending
        const isPendingParent = user.role === 'PARENT' && !user.parentApproved

        const ok = await bcrypt.compare(credentials.password, user.password)
        if (!ok) return null

        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name,
          isPendingParent,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.isPendingParent = user.isPendingParent
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.isPendingParent = token.isPendingParent as boolean
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
  debug: process.env.NODE_ENV === 'development'
}