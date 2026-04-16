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

  const end = new Date()
  end.setHours(23, 59, 59, 999)

  const [openTickets, wocTickets, woiTickets, closedToday, todaysSessions, agentsWithCount, lastSync] =
    await Promise.all([
      prisma.ticket.count({ where: { status: 'open' } }),
      prisma.ticket.count({ where: { status: 'woc' } }),
      prisma.ticket.count({ where: { status: 'woi' } }),
      prisma.ticket.count({ where: { status: 'closed', updatedAt: { gte: start } } }),
      prisma.calendarBooking.count({ where: { startUtc: { gte: start }, status: 'booked' } }),
      prisma.agent.findMany({
        where: { email: { in: ['khizar@support.com','pradeep@support.com','srijan@support.com','yashika@support.com'] } },
        include: { _count: { select: { sessions: true } } },
      }),
      prisma.syncLog.findFirst({ orderBy: { syncedAt: 'desc' } }),
    ])

  return NextResponse.json({
    openTickets, wocTickets, woiTickets, closedToday, todaysSessions,
    agentWorkload: agentsWithCount.map((a) => ({ name: a.name, count: a._count.sessions })),
    lastSync: lastSync?.syncedAt ?? null,
  })
}
