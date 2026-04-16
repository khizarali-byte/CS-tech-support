import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSessionAgent } from '@/lib/activity'

export async function POST() {
  const agent = await getSessionAgent()
  if (!agent) return NextResponse.json({ ok: false }, { status: 401 })

  // Upsert the most-recent login session for this agent
  const existing = await prisma.loginSession.findFirst({
    where: { agentId: agent.id },
    orderBy: { lastSeen: 'desc' },
  })

  if (existing) {
    await prisma.loginSession.update({
      where: { id: existing.id },
      data: { lastSeen: new Date() },
    })
  } else {
    await prisma.loginSession.create({
      data: { agentId: agent.id, agentName: agent.name },
    })
  }

  return NextResponse.json({ ok: true })
}
