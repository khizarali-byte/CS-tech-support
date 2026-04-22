'use client'
import useSWR from 'swr'
import { useState, useMemo } from 'react'
import { DateTime } from 'luxon'
import { IST_TIMEZONE, ISSUE_TYPES, WORLD_TIMEZONES } from '@/lib/constants'
import { buildZoomInvite } from '@/lib/zoom'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then(r => r.json())

const HOURS = Array.from({ length: 17 }, (_, i) => i + 7) // 07:00 – 23:00

const ROOM_COLORS: Record<string, string> = {
  account1: '#FFD600',
  account2: '#FF8C00',
}

function statusDot(status: string) {
  if (status === 'no_show')   return { color: '#FF8800', label: 'No Show' }
  if (status === 'cancelled') return { color: '#6B7280', label: 'Cancelled' }
  return { color: '#00FF87', label: 'Booked' }
}

// ── Booking card ──────────────────────────────────────────────────
function BookingCard({ b, accent, onCancel }: { b: any; accent: string; onCancel: () => void }) {
  const start     = DateTime.fromISO(b.startUtc).setZone(IST_TIMEZONE)
  const end       = DateTime.fromISO(b.endUtc).setZone(IST_TIMEZONE)
  const dot       = statusDot(b.status)
  const issueLabel = b.session?.issueType ? (ISSUE_TYPES[b.session.issueType] ?? b.session.issueType) : null
  const studentId  = b.session?.studentId ?? null

  function copyInvite() {
    if (!b.zoomJoinUrl) { toast.error('No Zoom room configured'); return }
    const msg = buildZoomInvite({
      studentName: b.studentName || undefined,
      agentName:   b.agent?.name || 'Support Team',
      title:       b.title,
      startIst:    start.toFormat('dd MMM yyyy, hh:mm a'),
      zoom: { name: b.zoomAccount || '', meetingId: b.zoomMeetingId || '', passcode: b.zoomPasscode || '', joinUrl: b.zoomJoinUrl || '' },
    })
    navigator.clipboard.writeText(msg)
    toast.success('Invite copied!')
  }

  return (
    <div style={{
      borderRadius: 9,
      border: `1.5px solid ${accent}30`,
      background: b.status === 'cancelled' ? 'rgba(255,255,255,0.02)' : `${accent}10`,
      padding: '8px 10px',
      marginBottom: 4,
      opacity: b.status === 'cancelled' ? 0.45 : 1,
    }}>
      {/* Time + status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 10.5, fontWeight: 700, color: accent, fontFamily: 'ui-monospace, monospace' }}>
          {start.toFormat('hh:mm a')} – {end.toFormat('hh:mm a')}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color: dot.color }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: dot.color, display: 'inline-block' }} />
          {dot.label}
        </span>
      </div>

      {/* Agent */}
      <p style={{ fontSize: 12, fontWeight: 700, color: '#E2E8F0', marginBottom: 3 }}>{b.agent?.name ?? '—'}</p>

      {/* Student */}
      {(b.studentName || studentId) && (
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 3 }}>
          {b.studentName}{studentId ? ` · ${studentId}` : ''}
        </p>
      )}

      {/* Issue type */}
      {issueLabel && (
        <span style={{
          display: 'inline-block', fontSize: 10, fontWeight: 600,
          color: accent, background: `${accent}15`,
          padding: '2px 7px', borderRadius: 99, border: `1px solid ${accent}25`,
          marginBottom: 5,
        }}>
          {issueLabel}
        </span>
      )}

      {/* Zoom actions */}
      {b.zoomJoinUrl && b.status === 'booked' && (
        <div style={{ display: 'flex', gap: 5, marginTop: 4 }}>
          <a href={b.zoomJoinUrl} target="_blank" rel="noopener noreferrer" style={{
            flex: 1, textAlign: 'center', fontSize: 10, fontWeight: 700,
            padding: '4px 6px', borderRadius: 6, background: accent,
            color: '#000', textDecoration: 'none',
          }}>
            Join ↗
          </a>
          <button onClick={copyInvite} style={{
            flex: 1, fontSize: 10, fontWeight: 700, padding: '4px 6px',
            borderRadius: 6, background: `${accent}20`, color: accent,
            border: `1px solid ${accent}30`, cursor: 'pointer',
          }}>
            Copy Invite
          </button>
        </div>
      )}

      {b.status === 'booked' && (
        <button onClick={onCancel} style={{
          marginTop: 5, fontSize: 10, color: 'rgba(255,255,255,0.2)',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}>
          Cancel booking
        </button>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────
export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(() => DateTime.now().setZone(IST_TIMEZONE).startOf('day'))
  const [showModal, setShowModal]     = useState(false)
  const [selectedHour, setSelectedHour] = useState<number | null>(null)

  const dateStr = currentDate.toISO()!

  const { data: bookings, mutate } = useSWR(
    `/api/calendar/bookings?date=${dateStr}&days=1`,
    fetcher,
    { refreshInterval: 15000 }
  )

  const acc1Bookings = useMemo(
    () => (bookings ?? []).filter((b: any) => b.zoomAccount === 'account1'),
    [bookings]
  )
  const acc2Bookings = useMemo(
    () => (bookings ?? []).filter((b: any) => b.zoomAccount === 'account2'),
    [bookings]
  )

  function getForHour(list: any[], hour: number) {
    return list.filter((b: any) => {
      const s = DateTime.fromISO(b.startUtc).setZone(IST_TIMEZONE)
      return s.hour === hour
    })
  }

  async function handleCancel(bookingId: string) {
    if (!confirm('Cancel this booking?')) return
    await fetch(`/api/calendar/bookings?bookingId=${bookingId}`, { method: 'DELETE' })
    toast.success('Booking cancelled')
    mutate()
  }

  const isToday = currentDate.hasSame(DateTime.now().setZone(IST_TIMEZONE), 'day')
  const nowHour = DateTime.now().setZone(IST_TIMEZONE).hour

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%' }}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#E2E8F0' }}>Calendar</h1>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>Zoom room availability · all times IST</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setCurrentDate(d => d.minus({ days: 1 }))} className="btn btn-ghost" style={{ padding: '7px 14px' }}>‹</button>
          <button onClick={() => setCurrentDate(DateTime.now().setZone(IST_TIMEZONE).startOf('day'))} className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: 12 }}>Today</button>
          <button onClick={() => setCurrentDate(d => d.plus({ days: 1 }))} className="btn btn-ghost" style={{ padding: '7px 14px' }}>›</button>
          <button
            onClick={() => { setSelectedHour(nowHour); setShowModal(true) }}
            className="btn btn-primary"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Book Slot
          </button>
        </div>
      </div>

      {/* ── Date label ──────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 17, fontWeight: 700, color: '#E2E8F0' }}>
          {currentDate.toFormat('EEEE, dd MMMM yyyy')}
        </span>
        {isToday && (
          <span style={{ fontSize: 11, fontWeight: 700, color: '#FFD600', background: 'rgba(255,214,0,0.1)', padding: '3px 10px', borderRadius: 99, border: '1px solid rgba(255,214,0,0.22)' }}>
            Today
          </span>
        )}
      </div>

      {/* ── Two-column grid ──────────────────────────────── */}
      <div className="glass-card" style={{ overflow: 'hidden', padding: 0, flex: 1 }}>

        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: '52px 1fr 1fr', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ background: 'rgba(255,255,255,0.02)', borderRight: '1px solid rgba(255,255,255,0.07)' }} />
          {(['account1', 'account2'] as const).map(acc => {
            const color = ROOM_COLORS[acc]
            const count = (acc === 'account1' ? acc1Bookings : acc2Bookings)
              .filter((b: any) => b.status === 'booked').length
            return (
              <div key={acc} style={{
                padding: '12px 16px',
                borderRight: '1px solid rgba(255,255,255,0.07)',
                display: 'flex', alignItems: 'center', gap: 10,
                background: `${color}08`,
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><rect x="3" y="6" width="12" height="12" rx="2"/><path d="M15 10l5-3v10l-5-3v-4z"/></svg>
                <div>
                  <p style={{ fontSize: 12.5, fontWeight: 700, color }}>{acc === 'account1' ? 'Zoom Room 1' : 'Zoom Room 2'}</p>
                  <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{count} session{count !== 1 ? 's' : ''} booked</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Scrollable time slots */}
        <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 320px)' }}>
          {HOURS.map(hour => {
            const label    = DateTime.fromObject({ hour }, { zone: IST_TIMEZONE }).toFormat('h a')
            const isNow    = isToday && hour === nowHour
            const acc1Slot = getForHour(acc1Bookings, hour)
            const acc2Slot = getForHour(acc2Bookings, hour)

            return (
              <div key={hour} style={{ display: 'grid', gridTemplateColumns: '52px 1fr 1fr', borderBottom: '1px solid rgba(255,255,255,0.04)', background: isNow ? 'rgba(0,212,255,0.03)' : undefined }}>
                {/* Time label */}
                <div style={{
                  padding: '8px 6px', textAlign: 'right',
                  borderRight: '1px solid rgba(255,255,255,0.07)',
                  background: 'rgba(255,255,255,0.01)',
                  display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', gap: 1,
                }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: isNow ? '#FFD600' : 'rgba(255,255,255,0.25)', fontFamily: 'ui-monospace, monospace' }}>
                    {label}
                  </span>
                  {isNow && <span style={{ width: 16, height: 2, background: '#FFD600', borderRadius: 99, marginLeft: 'auto' }} />}
                </div>

                {/* Acc1 cell */}
                <div
                  onClick={() => { if (!acc1Slot.filter((b: any) => b.status === 'booked').length) { setSelectedHour(hour); setShowModal(true) } }}
                  style={{
                    padding: '6px 8px', minHeight: 52,
                    borderRight: '1px solid rgba(255,255,255,0.07)',
                    cursor: acc1Slot.filter((b: any) => b.status === 'booked').length ? 'default' : 'pointer',
                  }}
                >
                  {acc1Slot.map((b: any) => (
                    <BookingCard key={b.id} b={b} accent={ROOM_COLORS.account1} onCancel={() => handleCancel(b.bookingId)} />
                  ))}
                </div>

                {/* Acc2 cell */}
                <div
                  onClick={() => { if (!acc2Slot.filter((b: any) => b.status === 'booked').length) { setSelectedHour(hour); setShowModal(true) } }}
                  style={{
                    padding: '6px 8px', minHeight: 52,
                    cursor: acc2Slot.filter((b: any) => b.status === 'booked').length ? 'default' : 'pointer',
                  }}
                >
                  {acc2Slot.map((b: any) => (
                    <BookingCard key={b.id} b={b} accent={ROOM_COLORS.account2} onCancel={() => handleCancel(b.bookingId)} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Booking modal ───────────────────────────────── */}
      {showModal && (
        <BookingModal
          date={currentDate.toFormat('yyyy-MM-dd')}
          hour={selectedHour ?? nowHour}
          onClose={() => setShowModal(false)}
          onBooked={() => { mutate(); setShowModal(false) }}
        />
      )}
    </div>
  )
}

// ── Booking modal ─────────────────────────────────────────────────
function BookingModal({ date, hour, onClose, onBooked }: {
  date: string; hour: number; onClose: () => void; onBooked: () => void
}) {
  const [loading, setLoading]           = useState(false)
  const [agentId, setAgentId]           = useState('')
  const [zoomAccount, setZoomAccount]   = useState<'account1' | 'account2'>('account1')
  const [title, setTitle]               = useState('')
  const [duration, setDuration]         = useState(30)
  const [studentName, setStudentName]   = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [userTz, setUserTz]             = useState('Asia/Kolkata')

  const { data: agents }     = useSWR<any[]>('/api/agents', fetcher)
  const { data: zoomConfig } = useSWR('/api/zoom', fetcher)

  const startDt = DateTime.fromObject(
    { year: parseInt(date.split('-')[0]), month: parseInt(date.split('-')[1]), day: parseInt(date.split('-')[2]), hour },
    { zone: IST_TIMEZONE }
  )
  const endDt = startDt.plus({ minutes: duration })

  async function handleBook() {
    if (!agentId) { toast.error('Select an agent'); return }
    if (!title)   { toast.error('Enter a title'); return }
    setLoading(true)

    const res = await fetch('/api/calendar/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId, title, zoomAccount,
        studentName:  studentName  || null,
        studentEmail: studentEmail || null,
        startUtc: startDt.toUTC().toISO(),
        endUtc:   endDt.toUTC().toISO(),
      }),
    })

    const data = await res.json()
    setLoading(false)
    if (res.status === 409) { toast.error(data.error || 'Booking conflict'); return }
    if (!res.ok)            { toast.error('Booking failed'); return }
    toast.success('Booked!')
    onBooked()
  }

  const acc1Name = zoomConfig?.account1?.name || 'Zoom Room 1'
  const acc2Name = zoomConfig?.account2?.name || 'Zoom Room 2'

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box" style={{ maxWidth: 460 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#E2E8F0' }}>Book Zoom Slot</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>
              {startDt.toFormat('dd MMM yyyy')} · {startDt.toFormat('hh:mm a')} IST
            </p>
          </div>
          <button onClick={onClose} style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 13 }}>
          <div>
            <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Agent *</label>
            <select className="input-field" value={agentId} onChange={e => setAgentId(e.target.value)}>
              <option value="">Select agent…</option>
              {agents?.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          <div>
            <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Zoom Room *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {(['account1', 'account2'] as const).map((acc) => {
                const color = ROOM_COLORS[acc]
                const name  = acc === 'account1' ? acc1Name : acc2Name
                return (
                  <button key={acc} type="button" onClick={() => setZoomAccount(acc)} style={{
                    padding: '9px 12px', borderRadius: 9, textAlign: 'left', cursor: 'pointer',
                    border: `2px solid ${zoomAccount === acc ? color : 'rgba(255,255,255,0.1)'}`,
                    background: zoomAccount === acc ? `${color}12` : 'rgba(255,255,255,0.03)',
                    transition: 'all 0.15s',
                  }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: zoomAccount === acc ? color : '#E2E8F0' }}>{name}</p>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Title *</label>
            <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Audio issue — Class support" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Duration</label>
              <select className="input-field" value={duration} onChange={e => setDuration(parseInt(e.target.value))}>
                {[15, 30, 45, 60, 90].map(d => <option key={d} value={d}>{d} min</option>)}
              </select>
            </div>
            <div>
              <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Student TZ</label>
              <select className="input-field" value={userTz} onChange={e => setUserTz(e.target.value)}>
                {WORLD_TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Student Name</label>
              <input className="input-field" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <label className="label-sm" style={{ display: 'block', marginBottom: 6 }}>Student Email</label>
              <input className="input-field" type="email" value={studentEmail} onChange={e => setStudentEmail(e.target.value)} placeholder="Optional" />
            </div>
          </div>

          {/* Time preview */}
          <div style={{ padding: '10px 14px', background: 'rgba(255,214,0,0.05)', borderRadius: 10, border: '1px solid rgba(255,214,0,0.14)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#FFD600', textTransform: 'uppercase', letterSpacing: '0.07em' }}>IST</p>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: '#E2E8F0', marginTop: 3 }}>{startDt.toFormat('hh:mm a')} – {endDt.toFormat('hh:mm a')}</p>
            </div>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#FFD600', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Student TZ</p>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: '#E2E8F0', marginTop: 3 }}>{startDt.setZone(userTz).toFormat('hh:mm a ZZZZ')}</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button onClick={handleBook} disabled={loading} className="btn btn-primary" style={{ flex: 2 }}>
            {loading ? 'Booking…' : 'Book Slot'}
          </button>
        </div>
      </div>
    </div>
  )
}
