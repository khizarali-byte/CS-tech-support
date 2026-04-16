'use client'
import useSWR from 'swr'
import { useState } from 'react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then(r => r.json())
const PERIODS = ['Today', 'This Week', 'This Month'] as const
type Period = typeof PERIODS[number]

const STATS = [
  { key: 'openTickets', label: 'Open',     sub: 'Awaiting action',     color: '#4D9EFF' },
  { key: 'wocTickets',  label: 'WOC',      sub: 'Waiting on customer', color: '#FFB800' },
  { key: 'woiTickets',  label: 'WOI',      sub: 'Waiting on internal', color: '#FF8800' },
  { key: 'closedToday', label: 'Resolved', sub: 'Closed this period',  color: '#00FF87' },
]

const AGENT_COLORS = ['#00D4FF', '#7C3AED', '#00FF87', '#FFB800', '#FF3D6A']

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>('Today')
  const { data, isLoading } = useSWR(`/api/dashboard?period=${period}`, fetcher, { refreshInterval: 30000 })
  const { data: recentTickets } = useSWR('/api/tickets?page=1', fetcher)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#E2E8F0' }}>Dashboard</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>
            {data?.lastSync
              ? `Synced ${new Date(data.lastSync).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`
              : 'Not yet synced with Freshdesk'}
          </p>
        </div>
        <div className="pill-filter">
          {PERIODS.map(p => (
            <button key={p} className={period === p ? 'active' : ''} onClick={() => setPeriod(p)}>{p}</button>
          ))}
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="page-grid-4">
        {STATS.map(s => {
          const val = isLoading ? '—' : (data?.[s.key] ?? 0)
          return (
            <div key={s.key} className="glass-card" style={{ padding: '20px 24px' }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: s.color, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 }}>
                {s.sub}
              </p>
              <p style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-3px', lineHeight: 1, color: '#E2E8F0' }}>
                {val}
              </p>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.35)', marginTop: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                {s.label}
              </p>
              <div style={{ marginTop: 14, height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.06)' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  background: s.color,
                  width: `${Math.min((Number(val) || 0) * 10, 100)}%`,
                  transition: 'width 0.4s ease',
                }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Middle Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16 }}>

        {/* Sessions */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#E2E8F0' }}>Sessions</p>
            <Link href="/sessions" style={{ fontSize: 11, fontWeight: 700, color: '#00D4FF', textDecoration: 'none' }}>VIEW ALL →</Link>
          </div>
          <p style={{ fontSize: 52, fontWeight: 800, letterSpacing: '-3px', lineHeight: 1, color: '#00D4FF', marginBottom: 4 }}>
            {data?.todaysSessions ?? 0}
          </p>
          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', marginBottom: 16 }}>{period}</p>
          <Link href="/sessions/new" className="btn btn-primary" style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            New Session
          </Link>
        </div>

        {/* Agent Workload */}
        <div className="glass-card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#E2E8F0' }}>Team Workload</p>
            <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{period}</span>
          </div>

          {data?.agentWorkload?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {data.agentWorkload.map((a: { name: string; count: number }, i: number) => {
                const max = Math.max(...data.agentWorkload.map((x: { count: number }) => x.count), 1)
                const pct = (a.count / max) * 100
                const c = AGENT_COLORS[i % AGENT_COLORS.length]
                return (
                  <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: `${c}15`, border: `1px solid ${c}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 700, color: c, flexShrink: 0,
                    }}>
                      {a.name[0]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: '#E2E8F0' }}>{a.name}</span>
                        <span style={{ fontSize: 12.5, fontWeight: 700, color: c }}>{a.count}</span>
                      </div>
                      <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)' }}>
                        <div style={{ height: '100%', borderRadius: 99, background: c, width: `${pct}%`, transition: 'width 0.4s ease' }} />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
              No session data for this period
            </p>
          )}
        </div>
      </div>

      {/* ── Recent Tickets ── */}
      <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: '#E2E8F0' }}>Recent Tickets</p>
          <Link href="/tickets" style={{ fontSize: 11, fontWeight: 700, color: '#00D4FF', textDecoration: 'none' }}>VIEW ALL →</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              {['Ticket ID', 'Subject', 'Source', 'Status', 'Updated'].map(h => <th key={h}>{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {recentTickets?.tickets?.slice(0, 5).map((t: {
              id: string; ticketId: string; subject: string; source: string; status: string; updatedAt: string
            }) => (
              <tr key={t.id} className="trow">
                <td><span className="mono" style={{ fontWeight: 700 }}>{t.ticketId}</span></td>
                <td style={{ maxWidth: 280 }}>
                  <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#E2E8F0' }}>
                    {t.subject}
                  </span>
                </td>
                <td>
                  <span style={{
                    fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)',
                    background: 'rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: 99,
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    {t.source?.replace('_', ' ')}
                  </span>
                </td>
                <td><StatusBadge status={t.status} /></td>
                <td style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, fontFamily: 'ui-monospace, monospace' }}>
                  {new Date(t.updatedAt).toLocaleDateString('en-IN')}
                </td>
              </tr>
            ))}
            {!recentTickets?.tickets?.length && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '32px 24px', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
                  No tickets yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}
