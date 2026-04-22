import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  // Protect the endpoint — Vercel sets Authorization: Bearer <CRON_SECRET> automatically
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Any session still 'scheduled' whose start was > 15 min ago is a no-show
  const cutoff = new Date(Date.now() - 15 * 60_000)

  const stale = await prisma.session.findMany({
    where: {
      status:          'scheduled',
      sessionTimingUtc: { lt: cutoff.toISOString() },
    },
    select: { id: true },
  })

  if (stale.length === 0) {
    return NextResponse.json({ updated: 0 })
  }

  const ids = stale.map(s => s.id)

  const [sessions, bookings] = await Promise.all([
    prisma.session.updateMany({
      where: { id: { in: ids } },
      data:  { status: 'no_show' },
    }),
    prisma.calendarBooking.updateMany({
      where: { sessionId: { in: ids }, status: 'booked' },
      data:  { status: 'no_show' },
    }),
  ])

  return NextResponse.json({ updated: sessions.count, bookingsUpdated: bookings.count })
}
