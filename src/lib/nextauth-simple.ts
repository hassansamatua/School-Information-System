import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

// Simple in-memory user store for testing
const users = [
  {
    id: 'admin-001',
    email: 'admin@school.edu',
    password: 'admin123', // In production, this would be hashed
    role: 'ADMIN',
    name: 'System Administrator'
  },
  {
    id: 'teacher-001',
    email: 'teacher@school.edu',
    password: 'teacher123',
    role: 'TEACHER',
    name: 'John Teacher'
  },
  {
    id: 'parent-001',
    email: 'parent@school.edu',
    password: 'parent123',
    role: 'PARENT',
    name: 'Jane Parent'
  }
]

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

        // Find user by email
        const user = users.find(u => u.email === credentials.email)
        
        if (!user || user.password !== credentials.password) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.name,
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
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
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