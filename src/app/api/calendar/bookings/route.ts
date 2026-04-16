import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateBookingId } from '@/lib/utils'
import { getZoomConfig } from '@/lib/zoom'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const agentId = searchParams.get('agentId')
  const date    = searchParams.get('date')

  const where: any = {}
  if (agentId) where.agentId = agentId
  if (date) {
    const d    = new Date(date)
    const next = new Date(d)
    next.setDate(next.getDate() + 7)
    where.startUtc = { gte: d, lt: next }
  }

  const bookings = await prisma.calendarBooking.findMany({
    where,
    include: { agent: true, session: true },
    orderBy: { startUtc: 'asc' },
  })
  return NextResponse.json(bookings)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { agentId, startUtc, endUtc, zoomAccount, studentEmail, studentName, ...rest } = body

  // Conflict: same agent can't have two overlapping bookings
  const agentConflict = await prisma.calendarBooking.findFirst({
    where: {
      agentId,
      status: 'booked',
      startUtc: { lt: new Date(endUtc) },
      endUtc:   { gt: new Date(startUtc) },
    },
  })
  if (agentConflict) {
    return NextResponse.json({ error: 'Agent already has a session at this time' }, { status: 409 })
  }

  // Conflict: same Zoom room can't have two overlapping bookings
  if (zoomAccount) {
    const zoomConflict = await prisma.calendarBooking.findFirst({
      where: {
        zoomAccount,
        status: 'booked',
        startUtc: { lt: new Date(endUtc) },
        endUtc:   { gt: new Date(startUtc) },
      },
    })
    if (zoomConflict) {
      return NextResponse.json({ error: 'This Zoom room is already booked at this time. Please use the other account.' }, { status: 409 })
    }
  }

  // Attach Zoom account details from env config
  const zoom = zoomAccount ? getZoomConfig(zoomAccount) : null

  const bookingId = await generateBookingId()
  const booking = await prisma.calendarBooking.create({
    data: {
      bookingId,
      agentId,
      startUtc:      new Date(startUtc),
      endUtc:        new Date(endUtc),
      zoomAccount:   zoomAccount   || null,
      zoomMeetingId: zoom?.meetingId || null,
      zoomPasscode:  zoom?.passcode  || null,
      zoomJoinUrl:   zoom?.joinUrl   || null,
      studentEmail:  studentEmail  || null,
      studentName:   studentName   || null,
      ...rest,
    },
    include: { agent: true },
  })
  return NextResponse.json(booking, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const bookingId = searchParams.get('bookingId')
  if (!bookingId) return NextResponse.json({ error: 'bookingId required' }, { status: 400 })

  await prisma.calendarBooking.updateMany({
    where: { bookingId },
    data: { status: 'cancelled' },
  })
  return NextResponse.json({ ok: true })
}
