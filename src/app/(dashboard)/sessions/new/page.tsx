'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import useSWR from 'swr'
import toast from 'react-hot-toast'
import { LOCATIONS, WORLD_TIMEZONES, STATUS_DESCRIPTIONS, SESSION_TYPE_LABELS, IST_TIMEZONE } from '@/lib/constants'
import { fromISTtoUTC } from '@/lib/timezone'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const LOCATION_GROUPS = LOCATIONS.reduce<Record<string, typeof LOCATIONS>>((acc, loc) => {
  if (!acc[loc.region]) acc[loc.region] = []
  acc[loc.region].push(loc)
  return acc
}, {})

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="glass-card" style={{ overflow: 'hidden' }}>
      <div style={{
        padding: '13px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', gap: 10,
        background: 'rgba(255,255,255,0.02)',
      }}>
        <span style={{ color: '#00D4FF' }}>{icon}</span>
        <p style={{ fontSize: 12.5, fontWeight: 700, color: '#E2E8F0', letterSpacing: '-0.1px' }}>{title}</p>
      </div>
      <div style={{ padding: 20 }}>{children}</div>
    </div>
  )
}

function Label({ children, required, hint }: { children: React.ReactNode; required?: boolean; hint?: string }) {
  return (
    <div style={{ marginBottom: 7 }}>
      <label style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
        {children}{required && <span style={{ color: '#FF3D6A', marginLeft: 3 }}>*</span>}
      </label>
      {hint && <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.2)', marginTop: 2 }}>{hint}</p>}
    </div>
  )
}

export default function NewSessionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [ticketSearch, setTicketSearch] = useState('')
  const [userSearch, setUserSearch] = useState('')

  const [form, setForm] = useState({
    agentId:                 '',
    ticketId:                '',
    userId:                  '',
    ticketSource:            'email_ticket',
    userLocation:            '',
    userTimezone:            'Asia/Kolkata',
    issueReported:           '',
    status:                  'open',
    sessionType:             'live_class_support',
    sessionDate:             '',
    sessionTimingIst:        '',
    issueFoundDuringSession: '',
    rootCause:               '',
    resolution:              '',
    zoomRecordingUrl:        '',
  })

  const { data: agents }     = useSWR<any[]>('/api/agents', fetcher)
  const { data: ticketsData } = useSWR('/api/tickets?page=1&limit=200', fetcher)
  const { data: usersData }   = useSWR('/api/users', fetcher)

  const filteredTickets = useMemo(() => {
    const all = ticketsData?.tickets || []
    if (!ticketSearch) return all.slice(0, 50)
    const q = ticketSearch.toLowerCase()
    return all.filter((t: any) => t.ticketId?.toLowerCase().includes(q) || t.subject?.toLowerCase().includes(q)).slice(0, 30)
  }, [ticketsData, ticketSearch])

  const filteredUsers = useMemo(() => {
    const all = usersData || []
    if (!userSearch) return all.slice(0, 50)
    const q = userSearch.toLowerCase()
    return all.filter((u: any) => u.userId?.toLowerCase().includes(q) || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)).slice(0, 30)
  }, [usersData, userSearch])

  const selectedTicket = useMemo(() => ticketsData?.tickets?.find((t: any) => t.id === form.ticketId), [ticketsData, form.ticketId])
  const selectedUser   = useMemo(() => usersData?.find((u: any) => u.id === form.userId), [usersData, form.userId])

  const timePreview = useMemo(() => {
    if (!form.sessionDate || !form.sessionTimingIst) return null
    try {
      const utc = fromISTtoUTC(form.sessionDate, form.sessionTimingIst)
      return {
        userTime: utc.setZone(form.userTimezone).toFormat('dd MMM yyyy, hh:mm a ZZZZ'),
        istTime:  utc.setZone(IST_TIMEZONE).toFormat('hh:mm a'),
        utcTime:  utc.toFormat('hh:mm a') + ' UTC',
      }
    } catch { return null }
  }, [form.sessionDate, form.sessionTimingIst, form.userTimezone])

  function set(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function handleLocationChange(locationStr: string) {
    set('userLocation', locationStr)
    const loc = LOCATIONS.find(l => `${l.city}, ${l.country}` === locationStr)
    if (loc) set('userTimezone', loc.timezone)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.agentId)             { toast.error('Please select an agent'); return }
    if (!form.ticketId)            { toast.error('Please select a ticket'); return }
    if (!form.userId)              { toast.error('Please select a user'); return }
    if (!form.issueReported.trim()) { toast.error('Issue Reported is required'); return }
    setLoading(true)

    let sessionTimingUtc: string | undefined
    let sessionTimingUser: string | undefined
    if (form.sessionDate && form.sessionTimingIst) {
      const utc = fromISTtoUTC(form.sessionDate, form.sessionTimingIst)
      sessionTimingUtc  = utc.toISO() || undefined
      sessionTimingUser = utc.setZone(form.userTimezone).toFormat('dd MMM yyyy, hh:mm a ZZZZ')
    }

    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        sessionDate: form.sessionDate ? new Date(form.sessionDate).toISOString() : undefined,
        sessionTimingUtc,
        sessionTimingUser,
      }),
    })

    setLoading(false)
    if (res.ok) {
      toast.success('Session created')
      router.push('/sessions')
    } else {
      const err = await res.json()
      toast.error(err.message || 'Failed to create session')
    }
  }

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={() => router.back()} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.35)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
          Back
        </button>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#E2E8F0' }}>New Session</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>Fill in the details below to log a support session</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── 1. Assignment ── */}
        <Section title="Assignment" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            <div>
              <Label required>Support Agent</Label>
              <select className="input-field" value={form.agentId} onChange={e => set('agentId', e.target.value)}>
                <option value="">Select agent…</option>
                {agents?.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>

            <div>
              <Label required>Session Type</Label>
              <select className="input-field" value={form.sessionType} onChange={e => set('sessionType', e.target.value)}>
                {Object.entries(SESSION_TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label as string}</option>
                ))}
              </select>
            </div>

            <div>
              <Label required>Ticket</Label>
              <input
                className="input-field"
                placeholder="Search by ID or subject…"
                value={ticketSearch}
                onChange={e => setTicketSearch(e.target.value)}
                style={{ marginBottom: 8 }}
              />
              <select
                className="input-field"
                value={form.ticketId}
                onChange={e => set('ticketId', e.target.value)}
                size={Math.min(filteredTickets.length + 1, 5)}
                style={{ height: 'auto' }}
              >
                <option value="">— select ticket —</option>
                {filteredTickets.map((t: any) => (
                  <option key={t.id} value={t.id}>
                    {t.ticketId} · {t.subject?.slice(0, 55)}{(t.subject?.length || 0) > 55 ? '…' : ''}
                  </option>
                ))}
              </select>
              {selectedTicket && (
                <div style={{ marginTop: 8, padding: '9px 13px', background: 'rgba(0,212,255,0.08)', borderRadius: 9, border: '1px solid rgba(0,212,255,0.2)' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#00D4FF' }}>{selectedTicket.ticketId}</p>
                  <p style={{ fontSize: 12, color: 'rgba(0,212,255,0.7)', marginTop: 2 }}>{selectedTicket.subject}</p>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <Label required>Ticket Source</Label>
                <select className="input-field" value={form.ticketSource} onChange={e => set('ticketSource', e.target.value)}>
                  <option value="email_ticket">Email Ticket</option>
                  <option value="chat_ticket">Chat Ticket</option>
                </select>
              </div>
              <div>
                <Label required>Session Status</Label>
                <select className="input-field" value={form.status} onChange={e => set('status', e.target.value)}>
                  {Object.entries(STATUS_DESCRIPTIONS).map(([val, desc]) => (
                    <option key={val} value={val}>{desc as string}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </Section>

        {/* ── 2. User Details ── */}
        <Section title="User Details" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            <div>
              <Label required>User (Student / Teacher)</Label>
              <input
                className="input-field"
                placeholder="Search by ID, name, email…"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                style={{ marginBottom: 8 }}
              />
              <select
                className="input-field"
                value={form.userId}
                onChange={e => set('userId', e.target.value)}
                size={Math.min(filteredUsers.length + 1, 5)}
                style={{ height: 'auto' }}
              >
                <option value="">— select user —</option>
                {filteredUsers.map((u: any) => (
                  <option key={u.id} value={u.id}>
                    {u.userId} · {u.name} {u.role === 'teacher' ? '(Teacher)' : '(Student/Parent)'}
                  </option>
                ))}
              </select>
              {selectedUser && (
                <div style={{ marginTop: 8, padding: '9px 13px', background: 'rgba(0,255,135,0.07)', borderRadius: 9, border: '1px solid rgba(0,255,135,0.2)' }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: '#00FF87' }}>{selectedUser.userId} · {selectedUser.role === 'teacher' ? 'Teacher' : 'Student/Parent'}</p>
                  <p style={{ fontSize: 12.5, fontWeight: 600, color: 'rgba(0,255,135,0.8)', marginTop: 2 }}>{selectedUser.name}</p>
                  {selectedUser.email && <p style={{ fontSize: 11, color: 'rgba(0,255,135,0.5)', marginTop: 2 }}>{selectedUser.email}</p>}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <Label hint="Auto-fills the timezone below">User Location</Label>
                <select className="input-field" value={form.userLocation} onChange={e => handleLocationChange(e.target.value)}>
                  <option value="">Select city…</option>
                  {Object.entries(LOCATION_GROUPS).map(([region, locs]) => (
                    <optgroup key={region} label={`── ${region} ──`}>
                      {locs.map(l => (
                        <option key={`${l.city}-${l.country}`} value={`${l.city}, ${l.country}`}>
                          {l.city}, {l.country}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <Label hint="Auto-filled from location — you can override">User Timezone</Label>
                <select className="input-field" value={form.userTimezone} onChange={e => set('userTimezone', e.target.value)}>
                  {WORLD_TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        </Section>

        {/* ── 3. Scheduling ── */}
        <Section title="Scheduling" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <Label>Session Date</Label>
              <input type="date" className="input-field" value={form.sessionDate} onChange={e => set('sessionDate', e.target.value)} />
            </div>
            <div>
              <Label>Session Time (IST, 24h format)</Label>
              <input type="time" className="input-field" value={form.sessionTimingIst} onChange={e => set('sessionTimingIst', e.target.value)} />
            </div>
          </div>

          {timePreview && (
            <div style={{
              marginTop: 16, padding: '14px 18px',
              background: 'rgba(124,58,237,0.08)', borderRadius: 12,
              border: '1px solid rgba(124,58,237,0.2)',
              display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16,
            }}>
              {[
                { label: 'IST (Team)',       value: timePreview.istTime  },
                { label: 'UTC',              value: timePreview.utcTime  },
                { label: 'User Local Time',  value: timePreview.userTime },
              ].map(t => (
                <div key={t.label}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{t.label}</p>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: '#E2E8F0', marginTop: 5 }}>{t.value}</p>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* ── 4. Issue Details ── */}
        <Section title="Issue Details" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <Label required>Issue Reported by User</Label>
              <textarea
                className="input-field"
                value={form.issueReported}
                onChange={e => set('issueReported', e.target.value)}
                rows={3}
                style={{ resize: 'vertical', minHeight: 80 }}
                placeholder="Describe the issue the user reported…"
              />
            </div>
            <div>
              <Label>Issue Found During Session</Label>
              <textarea
                className="input-field"
                value={form.issueFoundDuringSession}
                onChange={e => set('issueFoundDuringSession', e.target.value)}
                rows={2}
                style={{ resize: 'vertical' }}
                placeholder="What did the agent find during the session?"
              />
            </div>
          </div>
        </Section>

        {/* ── 5. Resolution & Recording ── */}
        <Section title="Resolution & Recording" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <Label>Root Cause</Label>
                <textarea
                  className="input-field"
                  value={form.rootCause}
                  onChange={e => set('rootCause', e.target.value)}
                  rows={3}
                  style={{ resize: 'vertical', minHeight: 80 }}
                  placeholder="Root cause identified…"
                />
              </div>
              <div>
                <Label>Resolution</Label>
                <textarea
                  className="input-field"
                  value={form.resolution}
                  onChange={e => set('resolution', e.target.value)}
                  rows={3}
                  style={{ resize: 'vertical', minHeight: 80 }}
                  placeholder="How was it resolved?"
                />
              </div>
            </div>
            <div>
              <Label hint="Paste a Google Drive share link or Zoom recording URL">Recording URL</Label>
              <input
                className="input-field"
                value={form.zoomRecordingUrl}
                onChange={e => set('zoomRecordingUrl', e.target.value)}
                placeholder="https://drive.google.com/file/… or https://zoom.us/rec/…"
              />
            </div>
          </div>
        </Section>

        {/* ── Submit ── */}
        <div style={{ display: 'flex', gap: 12, paddingBottom: 8 }}>
          <button type="button" onClick={() => router.back()} className="btn btn-ghost" style={{ flex: 1 }}>
            Cancel
          </button>
          <button type="submit" disabled={loading} className="btn btn-primary" style={{ flex: 2, gap: 8 }}>
            {loading ? 'Creating…' : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
                Create Session
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  )
}
