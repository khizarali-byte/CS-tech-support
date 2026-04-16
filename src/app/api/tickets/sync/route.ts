import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchEmailTickets } from '@/lib/freshdesk'
import { generateTicketId } from '@/lib/utils'

export async function POST() {
  const lastSync = await prisma.syncLog.findFirst({ orderBy: { syncedAt: 'desc' } })
  const since = lastSync?.syncedAt

  let fetched = 0, created = 0, updated = 0
  const errors: string[] = []

  try {
    const tickets = await fetchEmailTickets(since)
    fetched = tickets.length

    for (const t of tickets) {
      const existing = await prisma.ticket.findUnique({ where: { freshdeskId: t.freshdeskId } })
      if (existing) {
        await prisma.ticket.update({
          where: { freshdeskId: t.freshdeskId },
          data: { status: t.status, syncedAt: new Date() },
        })
        updated++
      } else {
        const ticketId = await generateTicketId()
        await prisma.ticket.create({
          data: { ticketId, ...t, syncedAt: new Date() },
        })
        created++
      }
    }
  } catch (e: any) {
    errors.push(e.message)
  }

  const log = await prisma.syncLog.create({
    data: { ticketsFetched: fetched, ticketsCreated: created, ticketsUpdated: updated, errors: errors.join('; ') || null },
  })

  return NextResponse.json({ fetched, created, updated, errors, syncedAt: log.syncedAt })
}
