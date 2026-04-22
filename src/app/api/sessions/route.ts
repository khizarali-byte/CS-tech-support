import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateSessionId, generateBookingId } from '@/lib/utils'
import { logActivity, getSessionAgent } from '@/lib/activity'
import { getZoomConfig } from '@/lib/zoom'
import { classifySession } from '@/lib/classifier'

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
  if (!agent?.id) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const sessionId = await generateSessionId()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { agentId: _agentId, status: _status, ...rest } = body

  // ── Zoom auto-assignment ──────────────────────────────────────
  let assignedAccount: 'account1' | 'account2' | null = null

  if (rest.sessionTimingUtc && rest.duration) {
    const startUtc = new Date(rest.sessionTimingUtc)
    const endUtc   = new Date(startUtc.getTime() + Number(rest.duration) * 60_000)

    const overlap = (account: string) => ({
      zoomAccount: account,
      status:      { not: 'no_show' },
      startUtc:    { lt: endUtc },
      endUtc:      { gt: startUtc },
    })

    const [c1, c2] = await Promise.all([
      prisma.calendarBooking.findFirst({ where: overlap('account1') }),
      prisma.calendarBooking.findFirst({ where: overlap('account2') }),
    ])

    if      (c1 === null) assignedAccount = 'account1'
    else if (c2 === null) assignedAccount = 'account2'
    else {
      // Both busy — surface the earliest slot that opens up
      const next = await prisma.calendarBooking.findFirst({
        where:   { zoomAccount: { in: ['account1', 'account2'] }, status: { not: 'no_show' }, endUtc: { gt: startUtc } },
        orderBy: { endUtc: 'asc' },
        select:  { endUtc: true },
      })
      return NextResponse.json({
        message:      'Both Zoom rooms are booked at this time.',
        nextFreeSlot: next?.endUtc?.toISOString() ?? null,
      }, { status: 409 })
    }
  }

  // Create the session
  const session = await prisma.session.create({
    data: { sessionId, agentId: agent.id, status: 'scheduled', ...rest },
    include: { agent: true, ticket: true, user: true },
  })

  // Create linked CalendarBooking with snapshotted Zoom details
  if (assignedAccount && rest.sessionTimingUtc && rest.duration) {
    const startUtc = new Date(rest.sessionTimingUtc)
    const endUtc   = new Date(startUtc.getTime() + Number(rest.duration) * 60_000)
    const zoom     = getZoomConfig(assignedAccount)
    const bookingId = await generateBookingId()
    await prisma.calendarBooking.create({
      data: {
        bookingId,
        agentId:       agent.id,
        sessionId:     session.id,
        title:         `${rest.studentName || 'Session'} — ${rest.sessionType || ''}`,
        startUtc,
        endUtc,
        status:        'booked',
        zoomAccount:   assignedAccount,
        zoomMeetingId: zoom?.meetingId ?? null,
        zoomPasscode:  zoom?.passcode  ?? null,
        zoomJoinUrl:   zoom?.joinUrl   ?? null,
        studentName:   rest.studentName  ?? null,
        studentEmail:  rest.studentEmail ?? null,
      },
    })
  }

  // Fire-and-forget LLM classification (never awaited, never throws)
  void classifySession(session.id, session.rootCause, session.resolution)

  await logActivity({
    agentId: agent.id, agentName: agent.name,
    action: 'CREATE', entity: 'session',
    entityId: session.id, entityLabel: `Session ${session.sessionId}`,
    detail: { issueType: session.issueType, studentName: session.studentName, zoomAccount: assignedAccount },
  })
  return NextResponse.json({ ...session, zoomAccount: assignedAccount }, { status: 201 })
}
