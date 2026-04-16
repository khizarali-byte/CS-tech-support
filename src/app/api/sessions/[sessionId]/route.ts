import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logActivity, getSessionAgent } from '@/lib/activity'

export async function GET(_: NextRequest, { params }: { params: { sessionId: string } }) {
  const session = await prisma.session.findUnique({
    where: { sessionId: params.sessionId },
    include: { agent: true, ticket: true, user: true, booking: true },
  })
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(session)
}

export async function PATCH(req: NextRequest, { params }: { params: { sessionId: string } }) {
  const agent = await getSessionAgent()
  const body = await req.json()
  const session = await prisma.session.update({
    where: { sessionId: params.sessionId },
    data: body,
    include: { agent: true, ticket: true, user: true },
  })
  await logActivity({
    agentId: agent?.id, agentName: agent?.name ?? 'Unknown',
    action: 'UPDATE', entity: 'session',
    entityId: session.id, entityLabel: `Session ${session.sessionId}`,
    detail: body,
  })
  return NextResponse.json(session)
}

export async function DELETE(_: NextRequest, { params }: { params: { sessionId: string } }) {
  const agent = await getSessionAgent()
  const session = await prisma.session.findUnique({ where: { sessionId: params.sessionId } })
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.session.delete({ where: { sessionId: params.sessionId } })
  await logActivity({
    agentId: agent?.id, agentName: agent?.name ?? 'Unknown',
    action: 'DELETE', entity: 'session',
    entityLabel: `Session ${session.sessionId}`,
    detail: { issueReported: session.issueReported },
  })
  return NextResponse.json({ success: true })
}
