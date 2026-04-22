import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { DateTime } from 'luxon'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const weeks = Math.min(parseInt(searchParams.get('weeks') || '4'), 26)

  const since = DateTime.now().minus({ weeks }).startOf('week').toJSDate()

  const sessions = await prisma.session.findMany({
    where: { createdAt: { gte: since } },
    select: {
      createdAt:         true,
      issueType:         true,
      resolution:        true,
      resolutionPattern: true,
      agentId:           true,
      agent:             { select: { name: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  // ── Block 1: issue mix by ISO week ────────────────────────────
  const weekMap: Record<string, Record<string, number>> = {}
  for (const s of sessions) {
    const week = DateTime.fromJSDate(s.createdAt).toFormat("kkkk-'W'WW")
    if (!weekMap[week]) weekMap[week] = {}
    const type = s.issueType || 'other'
    weekMap[week][type] = (weekMap[week][type] || 0) + 1
  }
  const issueMix = Object.entries(weekMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, counts]) => ({ week, ...counts }))

  // ── Block 2: top resolution texts per issue type ──────────────
  const patternMap: Record<string, Record<string, number>> = {}
  for (const s of sessions) {
    if (!s.issueType) continue
    const text = s.resolutionPattern?.trim() || s.resolution?.trim()
    if (!text) continue
    if (!patternMap[s.issueType]) patternMap[s.issueType] = {}
    const key = text.slice(0, 120)
    patternMap[s.issueType][key] = (patternMap[s.issueType][key] || 0) + 1
  }
  const resolutionPatterns = Object.entries(patternMap).flatMap(([issueType, resMap]) =>
    Object.entries(resMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([resolution, count]) => ({ issueType, resolution, count }))
  ).sort((a, b) => b.count - a.count)

  // ── Block 3: agent throughput ─────────────────────────────────
  const agentMap: Record<string, { name: string; total: number; resolved: number; typed: number }> = {}
  for (const s of sessions) {
    const id   = s.agentId
    const name = s.agent?.name || 'Unknown'
    if (!agentMap[id]) agentMap[id] = { name, total: 0, resolved: 0, typed: 0 }
    agentMap[id].total++
    if (s.resolution?.trim()) agentMap[id].resolved++
    if (s.issueType)          agentMap[id].typed++
  }
  const agentThroughput = Object.values(agentMap)
    .sort((a, b) => b.total - a.total)
    .map(a => ({
      name:          a.name,
      total:         a.total,
      sessionsPerWk: Math.round((a.total / weeks) * 10) / 10,
      resolvedPct:   a.total > 0 ? Math.round((a.resolved / a.total) * 100) : 0,
      typedPct:      a.total > 0 ? Math.round((a.typed   / a.total) * 100) : 0,
    }))

  return NextResponse.json({ issueMix, resolutionPatterns, agentThroughput })
}
