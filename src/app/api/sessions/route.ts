import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSessionId } from '@/lib/utils'
import { logActivity, getSessionAgent } from '@/lib/activity'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const agentId = searchParams.get('agentId')
  const sessionType = searchParams.get('type')
  const period = searchParams.get('period')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 25

  const where: any = {}
  if (status) where.status = status
  if (agentId) where.agentId = agentId
  if (sessionType) where.sessionType = sessionType

  if (period) {
    const now = new Date()
    let start = new Date(); start.setHours(0, 0, 0, 0)
    if (period === 'This Week') { start = new Date(); start.setDate(now.getDate() - now.getDay()); start.setHours(0, 0, 0, 0) }
    else if (period === 'This Month') { start = new Date(now.getFullYear(), now.getMonth(), 1) }
    where.createdAt = { gte: start }
  }

  const [sessions, total] = await Promise.all([
    prisma.session.findMany({ where, include: { agent: true, ticket: true, user: true }, orderBy: { createdAt: 'desc' }, skip: (page - 1) * limit, take: limit }),
    prisma.session.count({ where }),
  ])

  return NextResponse.json({ sessions, total, page, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const agent = await getSessionAgent()
  const body = await req.json()
  const sessionId = await generateSessionId()
  const session = await prisma.session.create({ data: { sessionId, ...body }, include: { agent: true, ticket: true, user: true } })
  await logActivity({
    agentId: agent?.id, agentName: agent?.name ?? 'Unknown',
    action: 'CREATE', entity: 'session',
    entityId: session.id, entityLabel: `Session ${session.sessionId}`,
    detail: { issueReported: session.issueReported, agentName: session.agent?.name },
  })
  return NextResponse.json(session, { status: 201 })
}
