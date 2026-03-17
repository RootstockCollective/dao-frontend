import { PrismaClient } from '@prisma/client'

const url = process.env.DAO_DATA_DB_CONNECTION_STRING

const globalForPrisma = globalThis as typeof globalThis & {
  _prisma?: PrismaClient
}

if (url && !globalForPrisma._prisma) {
  globalForPrisma._prisma = new PrismaClient({
    datasources: { db: { url } },
  })
}

export const prisma: PrismaClient | undefined = globalForPrisma._prisma
