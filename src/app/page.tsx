import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/nextauth-simple'

export default async function Home() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }
  
  // Redirect to appropriate dashboard based on role
  switch (session.user.role) {
    case 'ADMIN':
      redirect('/admin')
    case 'TEACHER':
      redirect('/teacher')
    case 'PARENT':
      redirect('/parent')
    default:
      redirect('/login')
  }
}

