import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateRecordingId } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const ticketId = searchParams.get('ticketId')
  const where: any = {}
  if (ticketId) where.ticket = { ticketId }

  const recordings = await prisma.recording.findMany({
    where,
    include: { ticket: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(recordings)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const recordingId = await generateRecordingId()
  const rec = await prisma.recording.create({
    data: { recordingId, ...body },
    include: { ticket: true },
  })
  return NextResponse.json(rec, { status: 201 })
}
