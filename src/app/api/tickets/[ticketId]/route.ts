import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logActivity, getSessionAgent } from '@/lib/activity'

export async function GET(_: NextRequest, { params }: { params: { ticketId: string } }) {
  const ticket = await prisma.ticket.findUnique({
    where: { ticketId: params.ticketId },
    include: { user: true, sessions: { include: { agent: true } }, recordings: true },
  })
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(ticket)
}

export async function PATCH(req: NextRequest, { params }: { params: { ticketId: string } }) {
  const agent = await getSessionAgent()
  const body = await req.json()
  const ticket = await prisma.ticket.update({
    where: { ticketId: params.ticketId },
    data: body,
  })
  await logActivity({
    agentId: agent?.id, agentName: agent?.name ?? 'Unknown',
    action: 'UPDATE', entity: 'ticket',
    entityId: ticket.id, entityLabel: `Ticket ${ticket.ticketId}`,
    detail: body,
  })
  return NextResponse.json(ticket)
}

export async function DELETE(_: NextRequest, { params }: { params: { ticketId: string } }) {
  const agent = await getSessionAgent()
  const ticket = await prisma.ticket.findUnique({ where: { ticketId: params.ticketId } })
  if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  // Delete related records first
  await prisma.session.deleteMany({ where: { ticketId: ticket.id } })
  await prisma.recording.deleteMany({ where: { ticketId: ticket.id } })
  await prisma.ticket.delete({ where: { ticketId: params.ticketId } })
  await logActivity({
    agentId: agent?.id, agentName: agent?.name ?? 'Unknown',
    action: 'DELETE', entity: 'ticket',
    entityLabel: `Ticket ${ticket.ticketId}`,
    detail: { subject: ticket.subject },
  })
  return NextResponse.json({ success: true })
}
