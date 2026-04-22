import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()

import { defineConfig } from 'prisma/config'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const dbUrl = process.env.DATABASE_URL ?? 'file:./prisma/dev.db'
const isLocal = dbUrl.startsWith('file:')

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: isLocal ? dbUrl : 'file:./prisma/dev.db',
    adapter: isLocal ? undefined : () =>
      new PrismaLibSql({ url: dbUrl, authToken: process.env.TURSO_AUTH_TOKEN }),
  },
})
