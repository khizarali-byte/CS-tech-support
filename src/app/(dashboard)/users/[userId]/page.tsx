'use client'
import useSWR from 'swr'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { WORLD_TIMEZONES } from '@/lib/constants'
import { StatusBadge } from '@/components/shared/StatusBadge'
import toast from 'react-hot-toast'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function UserDetailPage() {
  const { userId } = useParams<{ userId: string }>()
  const router = useRouter()
  const { data: user, isLoading, mutate } = useSWR(`/api/users/${userId}`, fetcher)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (user && !user.error) {
      setForm({ name: user.name, email: user.email || '', phone: user.phone || '', location: user.location || '', timezone: user.timezone || 'Asia/Kolkata' })
    }
  }, [user])

  async function handleSave() {
    setSaving(true)
    const res = await fetch(`/api/users/${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    if (res.ok) { toast.success('User updated'); setEditing(false); mutate() }
    else toast.error('Update failed')
  }

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' })
    setDeleting(false)
    if (res.ok) { toast.success('User deleted'); router.push('/users') }
    else toast.error('Delete failed — user may have linked sessions')
  }

  if (isLoading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'rgba(255,255,255,0.3)' }}>Loading…</div>
  if (!user || user.error) return <div style={{ textAlign: 'center', padding: 60, color: 'rgba(255,255,255,0.3)' }}>User not found</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 900 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button onClick={() => router.back()} style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>← Back</button>
          <div>
            <p style={{ fontSize: 18, fontWeight: 800, color: '#E2E8F0' }}>{user.name}</p>
            <p className="mono" style={{ fontSize: 11, color: '#A78BFA', marginTop: 2 }}>{user.userId}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn btn-ghost" style={{ fontSize: 12.5 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit
            </button>
          ) : (
            <>
              <button onClick={() => setEditing(false)} className="btn btn-ghost" style={{ fontSize: 12.5 }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn btn-primary" style={{ fontSize: 12.5 }}>
                {saving ? 'Saving…' : 'Save'}
              </button>
            </>
          )}
          <button onClick={() => setConfirmDelete(true)} className="btn btn-danger" style={{ fontSize: 12.5 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>
            Delete
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 16 }}>

        {/* Profile card */}
        <div className="glass-card" style={{ padding: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>Profile</p>
          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {(['name', 'email', 'phone', 'location'] as const).map(f => (
                <div key={f}>
                  <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>{f.charAt(0).toUpperCase() + f.slice(1)}</label>
                  <input name={f} value={form[f]} onChange={e => setForm(p => ({ ...p, [f]: e.target.value }))} className="input-field" />
                </div>
              ))}
              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Timezone</label>
                <select name="timezone" value={form.timezone} onChange={e => setForm(p => ({ ...p, timezone: e.target.value }))} className="input-field">
                  {WORLD_TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Role',     value: user.role?.replace('_', '/') },
                { label: 'Email',    value: user.email    || '—' },
                { label: 'Phone',    value: user.phone    || '—' },
                { label: 'Location', value: user.location || '—' },
                { label: 'Timezone', value: user.timezone },
                { label: 'Joined',   value: new Date(user.createdAt).toLocaleDateString('en-IN') },
              ].map(m => (
                <div key={m.label}>
                  <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.25)', marginBottom: 2 }}>{m.label}</p>
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{m.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket history */}
        <div className="glass-card" style={{ padding: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
            Ticket History ({user.tickets?.length || 0})
          </p>
          {!user.tickets?.length ? (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '24px 0' }}>No tickets yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {user.tickets.map((t: { id: string; ticketId: string; subject: string; status: string }) => (
                <div key={t.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="mono" style={{ fontSize: 11.5, color: '#A78BFA', fontWeight: 700 }}>{t.ticketId}</span>
                    <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.5)' }}>{t.subject}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <StatusBadge status={t.status} />
                    <Link href={`/tickets/${t.ticketId}`} style={{ fontSize: 11.5, fontWeight: 700, color: '#00D4FF', textDecoration: 'none', background: 'rgba(0,212,255,0.08)', padding: '4px 10px', borderRadius: 7, border: '1px solid rgba(0,212,255,0.15)' }}>
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirm modal */}
      {confirmDelete && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setConfirmDelete(false) }}>
          <div className="modal-box" style={{ maxWidth: 400 }}>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#E2E8F0', marginBottom: 8 }}>Delete User?</h2>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 24, lineHeight: 1.6 }}>
              This will permanently delete <strong style={{ color: '#E2E8F0' }}>{user.name}</strong>. This cannot be undone.
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
