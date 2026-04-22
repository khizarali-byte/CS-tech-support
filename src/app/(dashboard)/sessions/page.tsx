'use client'
import useSWR from 'swr'
import Link from 'next/link'
import { useState } from 'react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SESSION_TYPE_LABELS } from '@/lib/constants'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then(r => r.json())
const PERIODS = ['Today', 'This Week', 'This Month', 'All Time'] as const

export default function SessionsPage() {
  const [status, setStatus] = useState('')
  const [type, setType] = useState('')
  const [period, setPeriod] = useState('All Time')
  const [page, setPage] = useState(1)

  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (type) params.set('type', type)
  if (period !== 'All Time') params.set('period', period)
  params.set('page', String(page))

  const { data, isLoading } = useSWR(`/api/sessions?${params}`, fetcher)

  function exportCSV() {
    if (!data?.sessions?.length) { toast.error('No sessions to export'); return }
    const headers = ['Session ID','Agent','Student ID','Student Name','Student Email','Issue Type','Status','Type','Date (IST)','Timing (IST)','Duration (min)','Root Cause','Resolution','Zoom URL']
    const rows = data.sessions.map((s: Record<string, unknown> & { agent?: { name: string } }) => [
      s.sessionId, s.agent?.name, s.studentId, s.studentName, s.studentEmail,
      s.issueType, s.status, s.sessionType,
      s.sessionDate ? new Date(s.sessionDate as string).toLocaleDateString('en-IN') : '',
      s.sessionTimingIst, s.duration, s.rootCause, s.resolution, s.zoomRecordingUrl,
    ])
    const csv = [headers, ...rows].map(r => r.map((c: unknown) => `"${String(c||'').replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `sessions-${period.replace(' ','-')}.csv`
    a.click()
    toast.success('CSV exported')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{
            fontSize: 26, fontWeight: 800, letterSpacing: '-0.8px',
            background: 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Sessions</h1>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
            {data?.total || 0} records
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={exportCSV} className="btn btn-ghost">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export CSV
          </button>
          <Link href="/sessions/new" className="btn btn-primary">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            New Session
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <div className="pill-filter">
          {PERIODS.map(p => (
            <button key={p} className={period === p ? 'active' : ''} onClick={() => { setPeriod(p); setPage(1) }}>{p}</button>
          ))}
        </div>
        <select className="input-field" style={{ width: 160 }} value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="no_show">No Show</option>
        </select>
        <select className="input-field" style={{ width: 200 }} value={type} onChange={e => setType(e.target.value)}>
          <option value="">All Types</option>
          <option value="live_class_support">Live Class Support</option>
          <option value="live_class_monitoring">Live Class Monitoring</option>
          <option value="no_response">No Response</option>
          <option value="reschedule">Reschedule</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
        {isLoading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{ height: 46, borderRadius: 8, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.4s ease-in-out infinite' }} />
            ))}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ minWidth: 1100 }}>
              <thead>
                <tr>{['Session ID','Agent','Student','Issue Type','Status','Type','Date IST','Root Cause','Resolution','Recording',''].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {data?.sessions?.length === 0 && (
                  <tr><td colSpan={11} style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.2)' }}>No sessions found</td></tr>
                )}
                {data?.sessions?.map((s: {
                  id: string; sessionId: string;
                  agent?: { name: string };
                  status: string; sessionType: string;
                  sessionDate?: string; sessionTimingIst?: string;
                  studentId?: string; studentName?: string;
                  issueType?: string; rootCause?: string; resolution?: string;
                  zoomRecordingUrl?: string;
                }) => (
                  <tr key={s.id} className="trow">
                    <td><span className="mono" style={{ fontWeight: 700 }}>{s.sessionId}</span></td>
                    <td style={{ fontWeight: 500, color: '#E2E8F0' }}>{s.agent?.name}</td>
                    <td>
                      <div style={{ fontSize: 12.5, color: '#E2E8F0', fontWeight: 500 }}>{s.studentName || '—'}</div>
                      {s.studentId && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'ui-monospace, monospace' }}>{s.studentId}</div>}
                    </td>
                    <td>
                      {s.issueType
                        ? <span style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)', padding: '3px 9px', borderRadius: 99, border: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}>
                            {s.issueType.replace(/_/g, ' ')}
                          </span>
                        : <span style={{ color: 'rgba(255,255,255,0.15)' }}>—</span>}
                    </td>
                    <td><StatusBadge status={s.status} /></td>
                    <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{SESSION_TYPE_LABELS[s.sessionType] || s.sessionType}</td>
                    <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'ui-monospace, monospace' }}>
                      {s.sessionTimingIst || (s.sessionDate ? new Date(s.sessionDate).toLocaleDateString('en-IN') : '—')}
                    </td>
                    <td style={{ maxWidth: 140 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12.5, color: 'rgba(255,255,255,0.4)' }}>
                        {s.rootCause || '—'}
                      </span>
                    </td>
                    <td style={{ maxWidth: 140 }}>
                      <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12.5, color: 'rgba(255,255,255,0.4)' }}>
                        {s.resolution || '—'}
                      </span>
                    </td>
                    <td>
                      {s.zoomRecordingUrl
                        ? <a href={s.zoomRecordingUrl} target="_blank" rel="noopener noreferrer" style={{
                            fontSize: 11.5, fontWeight: 700, color: '#00D4FF',
                            display: 'flex', alignItems: 'center', gap: 4,
                            textDecoration: 'none', whiteSpace: 'nowrap',
                          }}>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            Watch
                          </a>
                        : <span style={{ color: 'rgba(255,255,255,0.15)' }}>—</span>}
                    </td>
                    <td>
                      <Link href={`/sessions/${s.sessionId}`} style={{
                        fontSize: 11.5, fontWeight: 700, color: '#00D4FF',
                        background: 'rgba(0,212,255,0.08)', padding: '5px 12px', borderRadius: 8,
                        textDecoration: 'none', border: '1px solid rgba(0,212,255,0.15)',
                        whiteSpace: 'nowrap',
                      }}>
                        Edit →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {(data?.pages || 0) > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-ghost" style={{ padding: '6px 14px' }}>← Prev</button>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>{page} / {data.pages}</span>
            <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="btn btn-ghost" style={{ padding: '6px 14px' }}>Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}
