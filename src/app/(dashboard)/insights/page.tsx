'use client'
import useSWR from 'swr'
import { useState } from 'react'
import { ISSUE_TYPES } from '@/lib/constants'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const WEEK_OPTIONS = [4, 12, 26] as const
type Weeks = typeof WEEK_OPTIONS[number]

const ISSUE_COLORS: Record<string, string> = {
  audio_video:       '#FFD600',
  screen_sharing:    '#FF8C00',
  login_access:      '#22C55E',
  app_browser_crash: '#EF4444',
  whiteboard:        '#F59E0B',
  network:           '#60A5FA',
  device_hardware:   '#A78BFA',
  other:             '#6B7280',
}

const AGENT_COLORS = ['#FFD600', '#FF8C00', '#22C55E', '#F59E0B']

// ── Stacked bar chart ─────────────────────────────────────────────
const CHART_H = 160

function StackedBarChart({ data }: { data: any[] }) {
  const issueKeys = Object.keys(ISSUE_TYPES)
  const maxTotal  = Math.max(
    ...data.map(w => issueKeys.reduce((s, k) => s + (w[k] || 0), 0)),
    1
  )

  if (data.length === 0) {
    return (
      <div style={{ height: CHART_H + 40, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
        No data for this period
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: CHART_H + 40, overflowX: 'auto', paddingBottom: 4 }}>
      {data.map((week) => {
        const total = issueKeys.reduce((s, k) => s + (week[k] || 0), 0)
        return (
          <div key={week.week} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 44 }}>
            {/* Total count */}
            <span style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.3)', fontFamily: 'ui-monospace, monospace' }}>
              {total}
            </span>
            {/* Bar */}
            <div style={{ width: 32, height: CHART_H, display: 'flex', flexDirection: 'column-reverse', gap: 1 }}>
              {issueKeys.map(key => {
                const count = week[key] || 0
                if (!count) return null
                const h = Math.max((count / maxTotal) * CHART_H, 2)
                return (
                  <div
                    key={key}
                    title={`${ISSUE_TYPES[key]}: ${count}`}
                    style={{ height: h, background: ISSUE_COLORS[key] || '#6B7280', borderRadius: 2, flexShrink: 0, transition: 'height 0.3s ease' }}
                  />
                )
              })}
            </div>
            {/* Week label */}
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', fontFamily: 'ui-monospace, monospace', whiteSpace: 'nowrap' }}>
              {week.week.split('-W')[1] ? `W${week.week.split('-W')[1]}` : week.week}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export default function InsightsPage() {
  const [weeks, setWeeks] = useState<Weeks>(4)
  const { data, isLoading } = useSWR(`/api/insights?weeks=${weeks}`, fetcher)

  const issueKeys = Object.keys(ISSUE_TYPES)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#E2E8F0' }}>Insights</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>Issue patterns, resolutions, and team throughput</p>
        </div>
        <div className="pill-filter">
          {WEEK_OPTIONS.map(w => (
            <button key={w} className={weeks === w ? 'active' : ''} onClick={() => setWeeks(w)}>
              {w}w
            </button>
          ))}
        </div>
      </div>

      {/* ── Block 1: Issue mix ──────────────────────────────────── */}
      <div className="glass-card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>Issue Mix</p>
            <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Session volume by issue type · last {weeks} weeks</p>
          </div>
        </div>

        {isLoading ? (
          <div style={{ height: CHART_H + 40, background: 'rgba(255,255,255,0.03)', borderRadius: 10, animation: 'pulse 1.4s ease-in-out infinite' }} />
        ) : (
          <div style={{ display: 'flex', gap: 24 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <StackedBarChart data={data?.issueMix ?? []} />
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, justifyContent: 'center', flexShrink: 0 }}>
              {issueKeys.map(key => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: ISSUE_COLORS[key], flexShrink: 0 }} />
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', whiteSpace: 'nowrap' }}>
                    {ISSUE_TYPES[key]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Block 2: Resolution patterns ────────────────────────── */}
      <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>Resolution Patterns</p>
          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Top resolutions per issue type · last {weeks} weeks</p>
        </div>

        {isLoading ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(5)].map((_, i) => <div key={i} style={{ height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.4s ease-in-out infinite' }} />)}
          </div>
        ) : !data?.resolutionPatterns?.length ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
            No resolution data yet — fill in the Resolution field when closing sessions
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {['Issue Type', 'Resolution', 'Count'].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {data.resolutionPatterns.map((p: { issueType: string; resolution: string; count: number }, i: number) => (
                <tr key={i} className="trow">
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      fontSize: 11, fontWeight: 600,
                      color: ISSUE_COLORS[p.issueType] || '#6B7280',
                      background: `${ISSUE_COLORS[p.issueType] || '#6B7280'}12`,
                      padding: '3px 9px', borderRadius: 99,
                      border: `1px solid ${ISSUE_COLORS[p.issueType] || '#6B7280'}25`,
                      whiteSpace: 'nowrap',
                    }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: ISSUE_COLORS[p.issueType] || '#6B7280', flexShrink: 0 }} />
                      {ISSUE_TYPES[p.issueType] || p.issueType}
                    </span>
                  </td>
                  <td style={{ fontSize: 12.5, color: '#E2E8F0', maxWidth: 420 }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {p.resolution}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', fontFamily: 'ui-monospace, monospace', minWidth: 24 }}>{p.count}</span>
                      <div style={{ flex: 1, height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)', minWidth: 60 }}>
                        <div style={{
                          height: '100%', borderRadius: 99,
                          background: ISSUE_COLORS[p.issueType] || '#6B7280',
                          width: `${Math.min(p.count / (data.resolutionPatterns[0]?.count || 1) * 100, 100)}%`,
                        }} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Block 3: Agent throughput ────────────────────────────── */}
      <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>Agent Throughput</p>
          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>Sessions, resolution rate, and form completeness · last {weeks} weeks</p>
        </div>

        {isLoading ? (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(4)].map((_, i) => <div key={i} style={{ height: 56, borderRadius: 8, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.4s ease-in-out infinite' }} />)}
          </div>
        ) : !data?.agentThroughput?.length ? (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>
            No session data for this period
          </div>
        ) : (
          <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {data.agentThroughput.map((a: { name: string; total: number; sessionsPerWk: number; resolvedPct: number; typedPct: number }, i: number) => {
              const color = AGENT_COLORS[i % AGENT_COLORS.length]
              return (
                <div key={a.name} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 1fr 1fr', gap: 16, alignItems: 'center' }}>
                  {/* Agent */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 30, height: 30, borderRadius: '50%', background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color, flexShrink: 0 }}>
                      {a.name[0]}
                    </div>
                    <div>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: '#E2E8F0' }}>{a.name}</p>
                      <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{a.sessionsPerWk}/wk avg</p>
                    </div>
                  </div>

                  {/* Total sessions */}
                  <Metric label="Total Sessions" value={a.total} color={color} pct={100} unit="" />

                  {/* Resolution rate */}
                  <Metric label="Resolution Rate" value={`${a.resolvedPct}%`} color={a.resolvedPct >= 70 ? '#00FF87' : a.resolvedPct >= 40 ? '#FFB800' : '#FF3D6A'} pct={a.resolvedPct} unit="%" />

                  {/* Issue type filled */}
                  <Metric label="Issue Typed" value={`${a.typedPct}%`} color={a.typedPct >= 90 ? '#00FF87' : a.typedPct >= 60 ? '#FFB800' : '#FF3D6A'} pct={a.typedPct} unit="%" />
                </div>
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

function Metric({ label, value, color, pct }: { label: string; value: string | number; color: string; pct: number; unit: string }) {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 12.5, fontWeight: 700, color, fontFamily: 'ui-monospace, monospace' }}>{value}</span>
      </div>
      <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ height: '100%', borderRadius: 99, background: color, width: `${Math.min(pct, 100)}%`, transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}
