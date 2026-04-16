'use client'
import useSWR from 'swr'
import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import toast from 'react-hot-toast'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const STATUS_OPTIONS = ['open', 'woc', 'woi', 'closed']
const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'urgent']

export default function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>()
  const router = useRouter()
  const { data: ticket, isLoading, mutate } = useSWR(`/api/tickets/${ticketId}`, fetcher)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  function startEdit() {
    setForm({
      subject:  ticket.subject  || '',
      status:   ticket.status   || 'open',
      priority: ticket.priority || 'medium',
    })
    setEditing(true)
  }

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/tickets/${ticketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) { toast.success('Ticket updated'); setEditing(false); mutate() }
    else toast.error('Update failed')
  }

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/tickets/${ticketId}`, { method: 'DELETE' })
    setDeleting(false)
    if (res.ok) { toast.success('Ticket deleted'); router.push('/tickets') }
    else toast.error('Delete failed')
  }

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'rgba(255,255,255,0.3)' }}>Loading…</div>
  )
  if (!ticket || ticket.error) return (
    <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)' }}>Ticket not found</div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => router.back()} style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
          <span className="mono" style={{ fontSize: 18, fontWeight: 800, color: '#E2E8F0' }}>{ticket.ticketId}</span>
          <StatusBadge status={ticket.status} />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!editing ? (
            <button onClick={startEdit} className="btn btn-ghost" style={{ fontSize: 12.5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </button>
          ) : (
            <>
              <button onClick={() => setEditing(false)} className="btn btn-ghost" style={{ fontSize: 12.5 }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ fontSize: 12.5 }}>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </>
          )}
          <button onClick={() => setConfirmDelete(true)} className="btn btn-danger" style={{ fontSize: 12.5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            Delete
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 16 }}>

        {/* Main */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="glass-card" style={{ padding: 20 }}>
            {editing ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label className="label-sm" style={{ display: 'block', marginBottom: 7 }}>Subject</label>
                  <input value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} className="input-field" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="label-sm" style={{ display: 'block', marginBottom: 7 }}>Status</label>
                    <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))} className="input-field">
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label-sm" style={{ display: 'block', marginBottom: 7 }}>Priority</label>
                    <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="input-field">
                      {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <p style={{ fontSize: 16, fontWeight: 700, color: '#E2E8F0', marginBottom: 8 }}>{ticket.subject}</p>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.35)' }}>
                  {ticket.source?.replace('_', ' ')} · Priority: <span style={{ color: '#FFB800' }}>{ticket.priority || 'medium'}</span>
                </p>
                {ticket.description && (
                  <div style={{ marginTop: 14, padding: 14, background: 'rgba(255,255,255,0.03)', borderRadius: 10, fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, border: '1px solid rgba(255,255,255,0.06)' }}>
                    {ticket.description}
                  </div>
                )}
              </>
            )}
          </div>

          {ticket.sessions?.length > 0 && (
            <div className="glass-card" style={{ padding: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#E2E8F0', marginBottom: 14 }}>Sessions ({ticket.sessions.length})</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {ticket.sessions.map((s: { id: string; sessionId: string; issueReported: string; agent?: { name: string }; status: string }) => (
                  <div key={s.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div>
                      <span className="mono" style={{ fontSize: 11.5, color: '#A78BFA', fontWeight: 700 }}>{s.sessionId}</span>
                      {s.agent && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginLeft: 10 }}>{s.agent.name}</span>}
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginLeft: 10 }}>· {s.issueReported}</span>
                    </div>
                    <Link href={`/sessions/${s.sessionId}`} style={{ fontSize: 11.5, fontWeight: 700, color: '#00D4FF', textDecoration: 'none', background: 'rgba(0,212,255,0.08)', padding: '4px 10px', borderRadius: 7, border: '1px solid rgba(0,212,255,0.15)' }}>
                      Edit →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {ticket.user && (
            <div className="glass-card" style={{ padding: 18 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>User</p>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: '#E2E8F0' }}>{ticket.user.name}</p>
              <p className="mono" style={{ fontSize: 11, color: '#A78BFA', marginTop: 3 }}>{ticket.user.userId}</p>
              <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>{ticket.user.role}</p>
            </div>
          )}
          <div className="glass-card" style={{ padding: 18 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Metadata</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: 'Created', value: new Date(ticket.createdAt).toLocaleString('en-IN') },
                { label: 'Updated', value: new Date(ticket.updatedAt).toLocaleString('en-IN') },
                ...(ticket.freshdeskId ? [{ label: 'Freshdesk', value: `#${ticket.freshdeskId}` }] : []),
              ].map(m => (
                <div key={m.label}>
                  <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.25)', marginBottom: 2 }}>{m.label}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setConfirmDelete(false) }}>
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#E2E8F0', marginBottom: 8 }}>Delete Ticket?</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24, lineHeight: 1.6 }}>
              This will permanently delete <strong style={{ color: '#E2E8F0' }}>{ticket.ticketId}</strong> and all its linked sessions and recordings. This cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setConfirmDelete(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleDelete} disabled={deleting} className="btn btn-danger" style={{ flex: 1 }}>
                {deleting ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
