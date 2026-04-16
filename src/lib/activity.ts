import { prisma } from './prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export async function logActivity(params: {
  agentId?: string | null
  agentName: string
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN'
  entity: string
  entityId?: string
  entityLabel?: string
  detail?: Record<string, unknown> | null
}) {
  try {
    await prisma.activityLog.create({
      data: {
        agentId:     params.agentId  ?? undefined,
        agentName:   params.agentName,
        action:      params.action,
        entity:      params.entity,
        entityId:    params.entityId,
        entityLabel: params.entityLabel,
        detail:      params.detail ? JSON.stringify(params.detail) : undefined,
      },
    })
  } catch {
    // Never fail the main operation because of logging
  }
}

/** Get the signed-in agent from server session. Returns null if unauthenticated. */
export async function getSessionAgent() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  return {
    id:   (session.user as { id?: string }).id ?? '',
    name: session.user.name ?? 'Unknown',
  }
}
