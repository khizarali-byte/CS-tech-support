import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(req: NextRequest, { params }: { params: { bookingId: string } }) {
  const body = await req.json()
  const booking = await prisma.calendarBooking.update({
    where: { bookingId: params.bookingId },
    data: body,
  })
  return NextResponse.json(booking)
}
