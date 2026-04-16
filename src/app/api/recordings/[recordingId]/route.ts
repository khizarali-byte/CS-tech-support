import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logActivity, getSessionAgent } from '@/lib/activity'

export async function GET(_: NextRequest, { params }: { params: { recordingId: string } }) {
  const rec = await prisma.recording.findUnique({
    where: { recordingId: params.recordingId },
    include: { ticket: true },
  })
  if (!rec) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(rec)
}

export async function PATCH(req: NextRequest, { params }: { params: { recordingId: string } }) {
  const agent = await getSessionAgent()
  const body = await req.json()
  const rec = await prisma.recording.update({ where: { recordingId: params.recordingId }, data: body })
  await logActivity({
    agentId: agent?.id, agentName: agent?.name ?? 'Unknown',
    action: 'UPDATE', entity: 'recording',
    entityId: rec.id, entityLabel: `Recording ${rec.recordingId}`,
    detail: body,
  })
  return NextResponse.json(rec)
}

export async function DELETE(_: NextRequest, { params }: { params: { recordingId: string } }) {
  const agent = await getSessionAgent()
  const rec = await prisma.recording.findUnique({ where: { recordingId: params.recordingId } })
  if (!rec) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  await prisma.recording.delete({ where: { recordingId: params.recordingId } })
  await logActivity({
    agentId: agent?.id, agentName: agent?.name ?? 'Unknown',
    action: 'DELETE', entity: 'recording',
    entityLabel: `Recording ${rec.recordingId}`,
    detail: { title: rec.title, url: rec.url },
  })
  return NextResponse.json({ success: true })
}
