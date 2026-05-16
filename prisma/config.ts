import { PrismaConfig } from '@prisma/config'

const config: PrismaConfig = {
  datasource: {
    url: process.env.DATABASE_URL,
  },
}

export default config