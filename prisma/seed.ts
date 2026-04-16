import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import bcrypt from 'bcryptjs'

const adapter = new PrismaLibSql({ url: 'file:./prisma/dev.db' })
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  const agents = [
    { name: 'Khizar Ali', email: 'khizar@support.com', password: 'Support@123' },
    { name: 'Pradeep', email: 'pradeep@support.com', password: 'Support@123' },
    { name: 'Srijan', email: 'srijan@support.com', password: 'Support@123' },
    { name: 'Yashika', email: 'yashika@support.com', password: 'Support@123' },
  ]

  for (const a of agents) {
    const passwordHash = await bcrypt.hash(a.password, 10)
    await prisma.agent.upsert({
      where: { email: a.email },
      update: {},
      create: { name: a.name, email: a.email, passwordHash },
    })
  }

  console.log('Seeded 4 agents successfully!')
  console.log('Login emails: khizar@support.com, pradeep@support.com, srijan@support.com, yashika@support.com')
  console.log('Default password: Support@123')
}

main().catch(console.error).finally(() => prisma.$disconnect())
