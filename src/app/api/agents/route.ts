import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// The 4 permanent team members
const TEAM = [
  { name: 'Khizar Ali', email: 'khizar@support.com',  password: 'Support@123' },
  { name: 'Pradeep',    email: 'pradeep@support.com', password: 'Support@123' },
  { name: 'Srijan',     email: 'srijan@support.com',  password: 'Support@123' },
  { name: 'Yashika',   email: 'yashika@support.com', password: 'Support@123' },
]
const TEAM_EMAILS = new Set(TEAM.map(a => a.email))

export async function GET() {
  // 1. Ensure all 4 team members exist
  for (const a of TEAM) {
    const existing = await prisma.agent.findUnique({ where: { email: a.email } })
    if (!existing) {
      const passwordHash = await bcrypt.hash(a.password, 10)
      await prisma.agent.create({ data: { name: a.name, email: a.email, passwordHash } })
    }
  }

  // 2. Remove any agents that are NOT in the team list and have no sessions
  const extras = await prisma.agent.findMany({
    where: { email: { notIn: Array.from(TEAM_EMAILS) } },
    include: { _count: { select: { sessions: true } } },
  })
  for (const agent of extras) {
    if (agent._count.sessions === 0) {
      await prisma.agent.delete({ where: { id: agent.id } })
    }
  }

  const agents = await prisma.agent.findMany({
    where: { email: { in: Array.from(TEAM_EMAILS) } },
    select: { id: true, name: true, email: true },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(agents)
}
