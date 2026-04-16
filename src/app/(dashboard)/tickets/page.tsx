'use client'
import useSWR from 'swr'
import Link from 'next/link'
import { useState } from 'react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function TicketsPage() {
  const [status, setStatus] = useState('')
  const [source, setSource] = useState('')
  const [page, setPage] = useState(1)
  const [syncing, setSyncing] = useState(false)

  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (source) params.set('source', source)
  params.set('page', String(page))

  const { data, isLoading, mutate } = useSWR(`/api/tickets?${params}`, fetcher)

  async function handleSync() {
    setSyncing(true)
    try {
      const res = await fetch('/api/tickets/sync', { method: 'POST' })
      const d = await res.json()
      toast.success(`Synced: ${d.created} new, ${d.updated} updated`)
      mutate()
    } catch {
      toast.error('Sync failed — check Freshdesk API key')
    }
    setSyncing(false)
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
          }}>Tickets</h1>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
            {data?.total || 0} total tickets
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={handleSync} disabled={syncing} className="btn btn-ghost">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={syncing ? { animation: 'spin 1s linear infinite' } : {}}>
              <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            {syncing ? 'Syncing…' : 'Sync Freshdesk'}
          </button>
          <Link href="/tickets/new" className="btn btn-primary">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            New Ticket
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <select className="input-field" style={{ width: 160 }} value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="woc">WOC</option>
          <option value="woi">WOI</option>
          <option value="closed">Closed</option>
        </select>
        <select className="input-field" style={{ width: 180 }} value={source} onChange={e => { setSource(e.target.value); setPage(1) }}>
          <option value="">All Sources</option>
          <option value="email_ticket">Email Ticket</option>
          <option value="chat_ticket">Chat Ticket</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
        {isLoading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: 46, borderRadius: 8, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.4s ease-in-out infinite' }} />
            ))}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>{['Ticket ID', 'Subject', 'Source', 'Status', 'User', 'Updated', ''].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {data?.tickets?.length === 0 && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.2)' }}>No tickets found</td></tr>
              )}
              {data?.tickets?.map((t: { id: string; ticketId: string; subject: string; source: string; status: string; user?: { name: string }; updatedAt: string }) => (
                <tr key={t.id} className="trow">
                  <td><span className="mono" style={{ fontWeight: 700 }}>{t.ticketId}</span></td>
                  <td style={{ maxWidth: 280 }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#E2E8F0', fontWeight: 500 }}>
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
                  <td style={{ color: 'rgba(255,255,255,0.5)' }}>{t.user?.name || '—'}</td>
                  <td style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'ui-monospace, monospace' }}>
                    {new Date(t.updatedAt).toLocaleDateString('en-IN')}
                  </td>
                  <td>
                    <Link href={`/tickets/${t.ticketId}`} style={{
                      fontSize: 11.5, fontWeight: 700, color: '#00D4FF',
                      background: 'rgba(0,212,255,0.08)', padding: '5px 12px', borderRadius: 8,
                      textDecoration: 'none', border: '1px solid rgba(0,212,255,0.15)',
                      transition: 'all 0.15s ease', display: 'inline-block',
                    }}>
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {data?.pages > 1 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            padding: '14px 24px', borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn btn-ghost" style={{ padding: '6px 14px' }}>← Prev</button>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', fontWeight: 600, fontFamily: 'ui-monospace, monospace' }}>
              {page} / {data.pages}
            </span>
            <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page === data.pages} className="btn btn-ghost" style={{ padding: '6px 14px' }}>Next →</button>
          </div>
        )}
      </div>
    </div>
  )
}
