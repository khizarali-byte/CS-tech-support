import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateUserId } from '@/lib/utils'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const role = searchParams.get('role')
  const search = searchParams.get('search')

  const where: any = {}
  if (role && role !== 'all') where.role = role
  if (search) where.OR = [
    { name: { contains: search } },
    { userId: { contains: search } },
    { email: { contains: search } },
  ]

  const users = await prisma.user.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(users)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const userId = await generateUserId(body.role)
  const user = await prisma.user.create({ data: { userId, ...body } })
  return NextResponse.json(user, { status: 201 })
}
