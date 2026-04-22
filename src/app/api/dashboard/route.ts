import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const period = searchParams.get('period') || 'Today'

  const now = new Date()
  let start = new Date()
  start.setHours(0, 0, 0, 0)

  if (period === 'This Week') {
    start = new Date()
    start.setDate(now.getDate() - now.getDay())
    start.setHours(0, 0, 0, 0)
  } else if (period === 'This Month') {
    start = new Date(now.getFullYear(), now.getMonth(), 1)
  }

  const [scheduled, completed, noShow, periodSessions, agentsWithCount] = await Promise.all([
    prisma.session.count({ where: { status: 'scheduled', createdAt: { gte: start } } }),
    prisma.session.count({ where: { status: 'completed', createdAt: { gte: start } } }),
    prisma.session.count({ where: { status: 'no_show',   createdAt: { gte: start } } }),
    prisma.session.count({ where: { createdAt: { gte: start } } }),
    prisma.agent.findMany({
      include: { _count: { select: { sessions: true } } },
    }),
  ])

  return NextResponse.json({
    scheduled,
    completed,
    noShow,
    periodSessions,
    agentWorkload: agentsWithCount.map((a) => ({ name: a.name, count: a._count.sessions })),
  })
}
