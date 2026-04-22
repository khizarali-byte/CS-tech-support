'use client'
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { DateTime } from 'luxon'
import { WORLD_TIMEZONES, SESSION_TYPE_LABELS, ISSUE_TYPES, SESSION_DURATIONS, IST_TIMEZONE } from '@/lib/constants'
import { fromISTtoUTC } from '@/lib/timezone'

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

  const [form, setForm] = useState({
    sessionType:      'live_class_support',
    sessionDate:      '',
    sessionTimingIst: '',
    duration:         '30',
    userTimezone:     'Asia/Kolkata',
    studentId:        '',
    studentName:      '',
    studentEmail:     '',
    issueType:        '',
    rootCause:        '',
    resolution:       '',
    zoomRecordingUrl: '',
  })

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.sessionType)             { toast.error('Session Type is required'); return }
    if (!form.sessionDate)             { toast.error('Session Date is required'); return }
    if (!form.sessionTimingIst)        { toast.error('Session Time is required'); return }
    if (!form.duration)                { toast.error('Duration is required'); return }
    if (!form.studentId.trim())        { toast.error('Student ID is required'); return }
    if (!form.studentName.trim())      { toast.error('Student Name is required'); return }
    if (!form.studentEmail.trim())     { toast.error('Student Email is required'); return }
    if (!form.issueType)               { toast.error('Issue Type is required'); return }

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
        sessionType:      form.sessionType,
        sessionDate:      form.sessionDate ? new Date(form.sessionDate).toISOString() : undefined,
        sessionTimingIst: form.sessionTimingIst,
        sessionTimingUtc,
        sessionTimingUser,
        duration:         parseInt(form.duration),
        userTimezone:     form.userTimezone,
        studentId:        form.studentId,
        studentName:      form.studentName,
        studentEmail:     form.studentEmail,
        issueType:        form.issueType,
        rootCause:        form.rootCause || undefined,
        resolution:       form.resolution || undefined,
        zoomRecordingUrl: form.zoomRecordingUrl || undefined,
      }),
    })

    setLoading(false)
    if (res.ok) {
      const data = await res.json()
      const room = data.zoomAccount === 'account1' ? 'Zoom Room 1' : data.zoomAccount === 'account2' ? 'Zoom Room 2' : null
      toast.success(room ? `Session created · assigned to ${room}` : 'Session created')
      router.push('/sessions')
    } else {
      const err = await res.json()
      if (res.status === 409 && err.nextFreeSlot) {
        const hint = DateTime.fromISO(err.nextFreeSlot).setZone(IST_TIMEZONE).toFormat('dd MMM, hh:mm a') + ' IST'
        toast.error(`Both Zoom rooms are booked. Next free slot: ${hint}`, { duration: 6000 })
      } else {
        toast.error(err.message || 'Failed to create session')
      }
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
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>Log a support session — under 30 seconds</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

        {/* ── 1. Session Details ── */}
        <Section title="Session Details" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <Label required>Session Type</Label>
              <select className="input-field" value={form.sessionType} onChange={e => set('sessionType', e.target.value)}>
                {Object.entries(SESSION_TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label as string}</option>
                ))}
              </select>
            </div>

            <div>
              <Label required>Duration (minutes)</Label>
              <select className="input-field" value={form.duration} onChange={e => set('duration', e.target.value)}>
                {SESSION_DURATIONS.map(d => (
                  <option key={d} value={d}>{d} min</option>
                ))}
              </select>
            </div>

            <div>
              <Label required>Session Date</Label>
              <input type="date" className="input-field" value={form.sessionDate} onChange={e => set('sessionDate', e.target.value)} />
            </div>

            <div>
              <Label required>Session Time (IST, 24h)</Label>
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
                { label: 'IST (Team)',      value: timePreview.istTime  },
                { label: 'UTC',             value: timePreview.utcTime  },
                { label: 'User Local Time', value: timePreview.userTime },
              ].map(t => (
                <div key={t.label}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{t.label}</p>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: '#E2E8F0', marginTop: 5 }}>{t.value}</p>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <Label hint="Used for User Local Time preview above">Student Timezone</Label>
            <select className="input-field" value={form.userTimezone} onChange={e => set('userTimezone', e.target.value)}>
              {WORLD_TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
            </select>
          </div>
        </Section>

        {/* ── 2. Student ── */}
        <Section title="Student" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <Label required>Student / Tutor ID</Label>
              <input
                className="input-field"
                value={form.studentId}
                onChange={e => set('studentId', e.target.value)}
                placeholder="e.g. STU-123456"
              />
            </div>
            <div>
              <Label required>Student / Tutor Name</Label>
              <input
                className="input-field"
                value={form.studentName}
                onChange={e => set('studentName', e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Label required>Student / Tutor Email</Label>
              <input
                type="email"
                className="input-field"
                value={form.studentEmail}
                onChange={e => set('studentEmail', e.target.value)}
                placeholder="email@example.com"
              />
            </div>
          </div>
        </Section>

        {/* ── 3. Issue ── */}
        <Section title="Issue" icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>}>
          <div>
            <Label required>Issue Type</Label>
            <select className="input-field" value={form.issueType} onChange={e => set('issueType', e.target.value)}>
              <option value="">Select issue type…</option>
              {Object.entries(ISSUE_TYPES).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>
          </div>
        </Section>

        {/* ── 4. Resolution & Recording ── */}
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
