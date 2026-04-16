import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const action = searchParams.get('action')
  const entity = searchParams.get('entity')
  const agentName = searchParams.get('agent')
  const limit = parseInt(searchParams.get('limit') || '100')

  const where: Record<string, unknown> = {}
  if (action) where.action = action
  if (entity) where.entity = entity
  if (agentName) where.agentName = { contains: agentName }

  const [logs, logins] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    }),
    // Active agents: seen in last 10 minutes
    prisma.loginSession.findMany({
      orderBy: { lastSeen: 'desc' },
      distinct: ['agentId'],
    }),
  ])

  const now = Date.now()
  const activeAgents = logins.map(s => ({
    agentId:   s.agentId,
    agentName: s.agentName,
    loginAt:   s.loginAt,
    lastSeen:  s.lastSeen,
    isOnline:  now - new Date(s.lastSeen).getTime() < 10 * 60 * 1000, // 10 min
  }))

  return NextResponse.json({ logs, activeAgents })
}
