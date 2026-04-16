import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logActivity, getSessionAgent } from '@/lib/activity'

export async function GET(_: NextRequest, { params }: { params: { userId: string } }) {
  const user = await prisma.user.findUnique({
    where: { userId: params.userId },
    include: { tickets: { include: { sessions: true } } },
  })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(user)
}

export async function PATCH(req: NextRequest, { params }: { params: { userId: string } }) {
  const agent = await getSessionAgent()
  const body = await req.json()
  const user = await prisma.user.update({ where: { userId: params.userId }, data: body })
  await logActivity({
    agentId: agent?.id, agentName: agent?.name ?? 'Unknown',
    action: 'UPDATE', entity: 'user',
    entityId: user.id, entityLabel: `User ${user.name}`,
    detail: body,
  })
  return NextResponse.json(user)
}

export async function DELETE(_: NextRequest, { params }: { params: { userId: string } }) {
  const agent = await getSessionAgent()
  const user = await prisma.user.findUnique({ where: { userId: params.userId } })
  if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.user.delete({ where: { userId: params.userId } })
  await logActivity({
    agentId: agent?.id, agentName: agent?.name ?? 'Unknown',
    action: 'DELETE', entity: 'user',
    entityLabel: `User ${user.name}`,
    detail: { name: user.name, email: user.email },
  })
  return NextResponse.json({ success: true })
}
