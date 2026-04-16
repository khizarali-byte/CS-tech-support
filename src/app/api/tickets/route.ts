import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTicketId } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status')
  const source = searchParams.get('source')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = 20

  const where: any = {}
  if (status) where.status = status
  if (source) where.source = source

  const [tickets, total] = await Promise.all([
    prisma.ticket.findMany({
      where,
      include: { user: true, sessions: { take: 1, orderBy: { createdAt: 'desc' } } },
      orderBy: { updatedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.ticket.count({ where }),
  ])

  return NextResponse.json({ tickets, total, page, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const ticketId = await generateTicketId()
  const ticket = await prisma.ticket.create({
    data: { ticketId, ...body },
  })
  return NextResponse.json(ticket, { status: 201 })
}
