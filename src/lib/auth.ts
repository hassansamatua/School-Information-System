import bcrypt from 'bcryptjs'
import { prisma } from './database'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createUser(email: string, password: string, role: 'ADMIN' | 'TEACHER' | 'PARENT') {
  const hashedPassword = await hashPassword(password)
  
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      role,
    },
  })
  
  return user
}

export async function getUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
    include: {
      admin: true,
      teacher: true,
      parent: true,
    },
  })
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    include: {
      admin: true,
      teacher: true,
      parent: true,
    },
  })
}