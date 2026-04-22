'use client'
import useSWR from 'swr'
import { useState } from 'react'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then(r => r.json())

type Recording = { id: string; recordingId: string; title?: string; url: string; notes?: string; createdAt: string }

export default function RecordingsPage() {
  const { data, isLoading, mutate } = useSWR('/api/recordings', fetcher)
  const [showAdd, setShowAdd] = useState(false)
  const [editRec, setEditRec] = useState<Recording | null>(null)
  const [form, setForm] = useState({ url: '', title: '', notes: '' })
  const [saving, setSaving] = useState(false)

  async function handleAdd() {
    if (!form.url) { toast.error('Recording URL is required'); return }
    setSaving(true)
    const res = await fetch('/api/recordings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: form.url, title: form.title }),
    })
    setSaving(false)
    if (!res.ok) { toast.error('Failed to add recording'); return }
    toast.success('Recording added')
    setShowAdd(false)
    setForm({ url: '', title: '', notes: '' })
    mutate()
  }

  async function handleEdit() {
    if (!editRec) return
    setSaving(true)
    const res = await fetch(`/api/recordings/${editRec.recordingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: form.title, notes: form.notes }),
    })
    setSaving(false)
    if (res.ok) { toast.success('Recording updated'); setEditRec(null); mutate() }
    else toast.error('Update failed')
  }

  async function handleDelete(recordingId: string) {
    await fetch(`/api/recordings/${recordingId}`, { method: 'DELETE' })
    toast.success('Deleted')
    mutate()
  }

  function openEdit(r: Recording) {
    setForm({ url: r.url, title: r.title || '', notes: r.notes || '' })
    setEditRec(r)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#E2E8F0' }}>Recordings</h1>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>Google Drive &amp; Zoom · {data?.length || 0} total</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn btn-primary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add Recording
        </button>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
        {isLoading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(5)].map((_, i) => <div key={i} style={{ height: 46, borderRadius: 8, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.4s ease-in-out infinite' }} />)}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>{['Recording ID', 'Title', 'URL', 'Date', ''].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {(!data || data.length === 0) && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.2)' }}>No recordings yet</td></tr>
              )}
              {data?.map((r: Recording) => (
                <tr key={r.id} className="trow">
                  <td><span className="mono" style={{ fontWeight: 700 }}>{r.recordingId}</span></td>
                  <td style={{ fontWeight: 500, color: '#E2E8F0' }}>{r.title || '—'}</td>
                  <td style={{ maxWidth: 260 }}>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#00D4FF', fontWeight: 600, textDecoration: 'none', fontSize: 13 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{r.url}</span>
                    </a>
                  </td>
                  <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'ui-monospace, monospace' }}>
                    {new Date(r.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button onClick={() => openEdit(r)} className="btn btn-ghost" style={{ padding: '5px 10px', fontSize: 11.5 }}>Edit</button>
                      <button onClick={() => handleDelete(r.recordingId)} className="btn btn-danger" style={{ padding: '5px 10px', fontSize: 11.5 }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setShowAdd(false) }}>
          <div className="modal-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: '#E2E8F0' }}>Add Recording</h2>
              <button onClick={() => setShowAdd(false)} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: 7 }}>Recording URL <span style={{ color: '#FF3D6A' }}>*</span></label>
                <input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} placeholder="https://drive.google.com/…" className="input-field" />
              </div>
              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: 7 }}>Title (optional)</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Session title…" className="input-field" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={() => setShowAdd(false)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleAdd} disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>{saving ? 'Saving…' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editRec && (
        <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) setEditRec(null) }}>
          <div className="modal-box">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#E2E8F0' }}>Edit Recording</h2>
                <p className="mono" style={{ fontSize: 11, color: '#A78BFA', marginTop: 3 }}>{editRec.recordingId}</p>
              </div>
              <button onClick={() => setEditRec(null)} style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: 7 }}>Title</label>
                <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="input-field" />
              </div>
              <div>
                <label className="label-sm" style={{ display: 'block', marginBottom: 7 }}>Notes</label>
                <input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} placeholder="Optional notes…" className="input-field" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
              <button onClick={() => setEditRec(null)} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleEdit} disabled={saving} className="btn btn-primary" style={{ flex: 1 }}>{saving ? 'Saving…' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
