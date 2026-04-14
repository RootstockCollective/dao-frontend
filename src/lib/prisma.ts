import { PrismaClient } from '@prisma/client'

const url = process.env.DAO_DATA_DB_CONNECTION_STRING

const globalForPrisma = globalThis as typeof globalThis & {
  _prisma?: PrismaClient
}

if (url && !globalForPrisma._prisma) {
  const separator = url.includes('?') ? '&' : '?'
  globalForPrisma._prisma = new PrismaClient({
    datasources: { db: { url: `${url}${separator}connection_limit=5` } },
  })
}

export const prisma: PrismaClient | undefined = globalForPrisma._prisma
