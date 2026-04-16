'use client'
import useSWR from 'swr'
import { useState } from 'react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

type LogEntry = {
  id: string
  agentName: string
  action: string
  entity: string
  entityLabel?: string
  detail?: string
  createdAt: string
}

type ActiveAgent = {
  agentId: string
  agentName: string
  loginAt: string
  lastSeen: string
  isOnline: boolean
}

const ACTION_COLORS: Record<string, { bg: string; color: string }> = {
  CREATE: { bg: 'rgba(0,255,135,0.12)',  color: '#00FF87' },
  UPDATE: { bg: 'rgba(0,212,255,0.12)',  color: '#00D4FF' },
  DELETE: { bg: 'rgba(255,61,106,0.12)', color: '#FF3D6A' },
  LOGIN:  { bg: 'rgba(167,139,250,0.12)',color: '#A78BFA' },
}

const ENTITY_ICONS: Record<string, string> = {
  ticket:    '🎫',
  session:   '👥',
  recording: '🎬',
  user:      '👤',
  auth:      '🔑',
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Date(date).toLocaleDateString('en-IN')
}

const AGENT_COLORS = ['#00D4FF', '#7C3AED', '#00FF87', '#FFB800']
const AGENTS = ['Khizar Ali', 'Pradeep', 'Srijan', 'Yashika']

function avatarColor(name: string) {
  const idx = AGENTS.findIndex(a => name.includes(a.split(' ')[0]))
  return AGENT_COLORS[idx >= 0 ? idx : Math.abs(name.charCodeAt(0)) % AGENT_COLORS.length]
}

export default function ActivityPage() {
  const [actionFilter, setActionFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('')

  const params = new URLSearchParams()
  if (actionFilter) params.set('action', actionFilter)
  if (entityFilter) params.set('entity', entityFilter)
  params.set('limit', '200')

  const { data, isLoading } = useSWR(`/api/activity?${params}`, fetcher, { refreshInterval: 15000 })

  const logs: LogEntry[]      = data?.logs        ?? []
  const activeAgents: ActiveAgent[] = data?.activeAgents ?? []

  const onlineCount = activeAgents.filter(a => a.isOnline).length

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#E2E8F0' }}>Activity History</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
            Every action made in the portal · auto-refreshes every 15s
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#00FF87', boxShadow: '0 0 8px rgba(0,255,135,0.8)', display: 'inline-block' }} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: '#00FF87' }}>{onlineCount} online now</span>
        </div>
      </div>

      {/* Active Agents */}
      <div className="glass-card" style={{ padding: 18 }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Team Status</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {activeAgents.length === 0 ? (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)' }}>No login sessions recorded yet</p>
          ) : activeAgents.map(a => {
            const c = avatarColor(a.agentName)
            return (
              <div key={a.agentId} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 16px', borderRadius: 12,
                background: a.isOnline ? `${c}10` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${a.isOnline ? `${c}30` : 'rgba(255,255,255,0.07)'}`,
              }}>
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: `${c}20`, border: `1.5px solid ${c}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: c,
                  }}>{a.agentName[0]}</div>
                  <span style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 10, height: 10, borderRadius: '50%',
                    background: a.isOnline ? '#00FF87' : 'rgba(255,255,255,0.2)',
                    border: '2px solid #080B14',
                    boxShadow: a.isOnline ? '0 0 6px rgba(0,255,135,0.8)' : 'none',
                  }} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700, color: a.isOnline ? '#E2E8F0' : 'rgba(255,255,255,0.4)' }}>{a.agentName}</p>
                  <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>
                    {a.isOnline ? 'Active now' : `Last seen ${timeAgo(a.lastSeen)}`}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <select className="input-field" style={{ width: 150 }} value={actionFilter} onChange={e => setActionFilter(e.target.value)}>
          <option value="">All Actions</option>
          <option value="LOGIN">Login</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
        </select>
        <select className="input-field" style={{ width: 160 }} value={entityFilter} onChange={e => setEntityFilter(e.target.value)}>
          <option value="">All Entities</option>
          <option value="auth">Auth / Login</option>
          <option value="ticket">Tickets</option>
          <option value="session">Sessions</option>
          <option value="recording">Recordings</option>
          <option value="user">Users</option>
        </select>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', alignSelf: 'center', marginLeft: 4 }}>
          {logs.length} entries
        </span>
      </div>

      {/* Activity Feed */}
      <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#E2E8F0' }}>Activity Log</p>
        </div>

        {isLoading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(8)].map((_, i) => <div key={i} style={{ height: 52, borderRadius: 8, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.4s ease-in-out infinite' }} />)}
          </div>
        ) : logs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
            No activity yet — actions will appear here as your team uses the portal
          </div>
        ) : (
          <div style={{ maxHeight: 600, overflowY: 'auto' }}>
            {logs.map((log, i) => {
              const ac = ACTION_COLORS[log.action] ?? { bg: 'rgba(255,255,255,0.06)', color: '#E2E8F0' }
              const c  = avatarColor(log.agentName)
              let detail: Record<string, unknown> | null = null
              try { if (log.detail) detail = JSON.parse(log.detail) } catch {}

              return (
                <div key={log.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 14,
                  padding: '14px 20px',
                  borderBottom: i < logs.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  transition: 'background 0.15s ease',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  {/* Avatar */}
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: `${c}20`, border: `1.5px solid ${c}40`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: c, marginTop: 1,
                  }}>{log.agentName[0]}</div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>{log.agentName}</span>
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em',
                        padding: '2px 8px', borderRadius: 99,
                        background: ac.bg, color: ac.color,
                      }}>{log.action}</span>
                      <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}>
                        {ENTITY_ICONS[log.entity] || '•'} {log.entityLabel || log.entity}
                      </span>
                    </div>
                    {detail && Object.keys(detail).length > 0 && (
                      <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.25)', marginTop: 4, fontFamily: 'ui-monospace, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {Object.entries(detail).map(([k, v]) => `${k}: ${v}`).join('  ·  ')}
                      </p>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.2)', flexShrink: 0, marginTop: 2, fontFamily: 'ui-monospace, monospace' }}>
                    {timeAgo(log.createdAt)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
