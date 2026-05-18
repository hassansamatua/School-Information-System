import { PrismaClient } from '@prisma/client'

// Create a singleton Prisma client with error handling
class Database {
  private static instance: PrismaClient | null = null
  private static isConnected: boolean = false

  static getInstance(): PrismaClient {
    if (!Database.instance) {
      Database.instance = new PrismaClient({
        log: ['error'],
      })
    }
    return Database.instance
  }

  static async connect(): Promise<boolean> {
    try {
      const prisma = Database.getInstance()
      await prisma.$connect()
      Database.isConnected = true
      return true
    } catch (error) {
      console.error('Database connection failed:', error)
      Database.isConnected = false
      return false
    }
  }

  static async disconnect(): Promise<void> {
    if (Database.instance) {
      await Database.instance.$disconnect()
      Database.instance = null
      Database.isConnected = false
    }
  }

  static isConnectionActive(): boolean {
    return Database.isConnected
  }
}

// Export both the class and a prisma instance for backward compatibility
export const prisma = new PrismaClient({
  log: ['error'],
})

export default Database