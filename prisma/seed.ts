import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@school.edu' },
    update: {},
    create: {
      email: 'admin@school.edu',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true,
      admin: {
        create: {
          firstName: 'System',
          lastName: 'Administrator',
          phone: '1234567890'
        }
      }
    }
  })

  // Create teacher user
  const teacherPassword = await bcrypt.hash('teacher123', 12)
  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@school.edu' },
    update: {},
    create: {
      email: 'teacher@school.edu',
      password: teacherPassword,
      role: 'TEACHER',
      isActive: true,
      teacher: {
        create: {
          firstName: 'John',
          lastName: 'Teacher',
          phone: '1234567890',
          employeeId: 'T001',
          department: 'Mathematics'
        }
      }
    }
  })

  // Create parent user
  const parentPassword = await bcrypt.hash('parent123', 12)
  const parent = await prisma.user.upsert({
    where: { email: 'parent@school.edu' },
    update: {},
    create: {
      email: 'parent@school.edu',
      password: parentPassword,
      role: 'PARENT',
      isActive: true,
      parent: {
        create: {
          firstName: 'Jane',
          lastName: 'Parent',
          phone: '0987654321'
        }
      }
    }
  })

  // Create a sample class
  const classData = await prisma.class.upsert({
    where: { id: 'class-1' },
    update: {},
    create: {
      id: 'class-1',
      name: 'Class 10A',
      section: 'A',
      grade: '10',
      maxStudents: 30,
      teacherId: teacher.id
    }
  })

  // Create a sample student
  const student = await prisma.student.upsert({
    where: { registrationNumber: 'S001' },
    update: {},
    create: {
      registrationNumber: 'S001',
      firstName: 'Test',
      lastName: 'Student',
      email: 'student@school.edu',
      classId: classData.id,
      parentId: parent.id,
      dateOfBirth: new Date('2008-01-01'),
      gender: 'MALE'
    }
  })

  console.log('Database seeded successfully!')
  console.log('Admin: admin@school.edu / admin123')
  console.log('Teacher: teacher@school.edu / teacher123')
  console.log('Parent: parent@school.edu / parent123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })