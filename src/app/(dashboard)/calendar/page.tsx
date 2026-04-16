'use client'
import useSWR from 'swr'
import { useState, useMemo } from 'react'
import { DateTime } from 'luxon'
import { IST_TIMEZONE, WORLD_TIMEZONES } from '@/lib/constants'
import { buildZoomInvite } from '@/lib/zoom'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then(r => r.json())
type ViewMode = 'Day' | 'Week' | 'Month'

const AGENT_COLORS: Record<string, string> = {
  'Khizar Ali': '#5046E5',
  'Pradeep':    '#7C3AED',
  'Srijan':     '#0EA5E9',
  'Yashika':    '#10B981',
}
const COLOR_LIST = ['#5046E5', '#7C3AED', '#0EA5E9', '#10B981']

function agentColor(name: string, i: number) {
  return AGENT_COLORS[name] || COLOR_LIST[i % COLOR_LIST.length]
}

// ── Booked slot card shown inside calendar grid ───────────────────
function BookingCard({ b, onCancel }: { b: any; onCancel: () => void }) {
  const start = DateTime.fromISO(b.startUtc).setZone(IST_TIMEZONE)
  const end   = DateTime.fromISO(b.endUtc).setZone(IST_TIMEZONE)
  const color = agentColor(b.agent?.name, 0)
  const cancelled = b.status === 'cancelled'

  function copyInvite() {
    if (!b.zoomJoinUrl) { toast.error('No Zoom room configured for this booking'); return }
    const msg = buildZoomInvite({
      studentName: b.studentName || undefined,
      agentName:   b.agent?.name || 'Support Team',
      title:       b.title,
      startIst:    start.toFormat('dd MMM yyyy, hh:mm a'),
      zoom: {
        name:      b.zoomAccount || '',
        meetingId: b.zoomMeetingId || '',
        passcode:  b.zoomPasscode  || '',
        joinUrl:   b.zoomJoinUrl   || '',
      },
    })
    navigator.clipboard.writeText(msg)
    toast.success('Invite copied to clipboard!')
  }

  return (
    <div style={{
      borderRadius: 9,
      border: `1.5px solid ${color}30`,
      background: cancelled ? '#F9FAFB' : `${color}0D`,
      padding: '7px 10px',
      marginBottom: 3,
      opacity: cancelled ? 0.5 : 1,
    }}>
      {/* Agent + time */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
        <div style={{ width: 7, height: 7, borderRadius: '50%', background: color, flexShrink: 0 }} />
        <span style={{ fontSize: 11, fontWeight: 700, color }}>{b.agent?.name}</span>
        {cancelled && <span style={{ fontSize: 10, color: '#9CA3AF', marginLeft: 'auto' }}>Cancelled</span>}
      </div>
      <p style={{ fontSize: 11.5, fontWeight: 600, color: '#0A0A12', marginBottom: 2, lineHeight: 1.3 }}>{b.title}</p>
      <p style={{ fontSize: 10.5, color: '#6B7280', marginBottom: b.zoomJoinUrl ? 7 : 0 }}>
        {start.toFormat('hh:mm a')} – {end.toFormat('hh:mm a')}
      </p>

      {/* Zoom details */}
      {b.zoomJoinUrl && !cancelled && (
        <div style={{ background: 'rgba(80,70,229,0.06)', borderRadius: 7, padding: '6px 8px', marginBottom: 5 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <svg width="11" height="11" viewBox="0 0 24 24" fill="#5046E5"><path d="M4 6h16v12H4z" opacity=".2"/><path d="M15 10l5-3v10l-5-3v-4z"/><rect x="3" y="6" width="12" height="12" rx="2" fill="none" stroke="#5046E5" strokeWidth="2"/></svg>
            <span style={{ fontSize: 10, fontWeight: 700, color: '#5046E5' }}>
              {b.zoomMeetingId} · {b.zoomPasscode}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            <a
              href={b.zoomJoinUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ flex: 1, textAlign: 'center', fontSize: 10, fontWeight: 700, padding: '4px 6px', borderRadius: 6, background: '#5046E5', color: '#fff', textDecoration: 'none' }}
            >
              Join ↗
            </a>
            <button
              onClick={copyInvite}
              style={{ flex: 1, fontSize: 10, fontWeight: 700, padding: '4px 6px', borderRadius: 6, background: '#EEF2FF', color: '#5046E5', border: 'none', cursor: 'pointer' }}
            >
              Copy Invite
            </button>
          </div>
          {b.studentName && (
            <p style={{ fontSize: 10, color: '#6B7280', marginTop: 4 }}>👤 {b.studentName}</p>
          )}
        </div>
      )}

      {/* Cancel button */}
      {!cancelled && (
        <button
          onClick={onCancel}
          style={{ fontSize: 10, color: '#9CA3AF', background: 'none', border: 'none', cursor: 'pointer', padding: 0, width: '100%', textAlign: 'left' }}
        >
          Cancel booking
        </button>
      )}
    </div>
  )
}

// ── Main calendar page ────────────────────────────────────────────
export default function CalendarPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('Week')
  const [currentDate, setCurrentDate] = useState(() => DateTime.now().setZone(IST_TIMEZONE))
  const [userTz, setUserTz] = useState('America/New_York')
  const [showModal, setShowModal] = useState(false)
  const [selectedSlot, setSelectedSlot] = useState<{ date: string; hour: number } | null>(null)

  const weekStart = currentDate.startOf('week')
  const { data: bookings, mutate } = useSWR(
    `/api/calendar/bookings?date=${weekStart.toISO()}`,
    fetcher,
    { refreshInterval: 15000 }
  )

  const days = useMemo(() => {
    if (viewMode === 'Day')   return [currentDate]
    if (viewMode === 'Week')  return Array.from({ length: 7 }, (_, i) => weekStart.plus({ days: i }))
    return Array.from({ length: currentDate.daysInMonth! }, (_, i) => currentDate.startOf('month').plus({ days: i }))
  }, [viewMode, currentDate, weekStart])

  const hours = Array.from({ length: 24 }, (_, i) => i)

  function navigate(dir: 1 | -1) {
    if (viewMode === 'Day')   setCurrentDate(d => d.plus({ days: dir }))
    if (viewMode === 'Week')  setCurrentDate(d => d.plus({ weeks: dir }))
    if (viewMode === 'Month') setCurrentDate(d => d.plus({ months: dir }))
  }

  function getLabel() {
    if (viewMode === 'Day')   return currentDate.toFormat('EEEE, dd MMMM yyyy')
    if (viewMode === 'Week')  return `${weekStart.toFormat('dd MMM')} – ${weekStart.plus({ days: 6 }).toFormat('dd MMM yyyy')}`
    return currentDate.toFormat('MMMM yyyy')
  }

  function getBookingsForSlot(day: DateTime, hour: number) {
    if (!bookings) return []
    return bookings.filter((b: any) => {
      const s = DateTime.fromISO(b.startUtc).setZone(IST_TIMEZONE)
      return s.day === day.day && s.month === day.month && s.hour === hour
    })
  }

  function getBookingsForDay(day: DateTime) {
    if (!bookings) return []
    return bookings.filter((b: any) => {
      const s = DateTime.fromISO(b.startUtc).setZone(IST_TIMEZONE)
      return s.hasSame(day, 'day')
    })
  }

  async function handleCancel(bookingId: string) {
    if (!confirm('Cancel this booking?')) return
    await fetch(`/api/calendar/bookings?bookingId=${bookingId}`, { method: 'DELETE' })
    toast.success('Booking cancelled')
    mutate()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, height: '100%' }}>

      {/* ── Header ─────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Calendar</h1>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginTop: 3 }}>
            Zoom session scheduling · all times in IST
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
          {/* User TZ for preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600 }}>Student TZ:</span>
            <select className="input-field" style={{ width: 210 }} value={userTz} onChange={e => setUserTz(e.target.value)}>
              {WORLD_TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
            </select>
          </div>

          {/* View toggle */}
          <div className="pill-filter">
            {(['Day','Week','Month'] as ViewMode[]).map(v => (
              <button key={v} className={viewMode === v ? 'active' : ''} onClick={() => setViewMode(v)}>{v}</button>
            ))}
          </div>

          {/* Navigation */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => navigate(-1)} className="btn btn-ghost" style={{ padding: '7px 12px' }}>‹</button>
            <button onClick={() => setCurrentDate(DateTime.now().setZone(IST_TIMEZONE))} className="btn btn-ghost" style={{ padding: '7px 14px', fontSize: 12 }}>Today</button>
            <button onClick={() => navigate(1)} className="btn btn-ghost" style={{ padding: '7px 12px' }}>›</button>
          </div>
        </div>
      </div>

      {/* ── Sub-header: date label + book button ───────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: '#0A0A12' }}>{getLabel()}</span>
        <button
          onClick={() => { setSelectedSlot({ date: currentDate.toFormat('yyyy-MM-dd'), hour: DateTime.now().setZone(IST_TIMEZONE).hour }); setShowModal(true) }}
          className="btn btn-primary"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Book Zoom Session
        </button>
      </div>

      {/* ── Zoom account legend ─────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', padding: '10px 16px', background: '#FFFFFF', borderRadius: 12, boxShadow: '0 0 0 1px rgba(0,0,0,0.05)' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Agents</span>
        {['Khizar Ali','Pradeep','Srijan','Yashika'].map((name, i) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: agentColor(name, i) }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: '#374151' }}>{name}</span>
          </div>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="#5046E5"><path d="M4 6h16v12H4z" opacity=".15"/><path d="M15 10l5-3v10l-5-3v-4z"/><rect x="3" y="6" width="12" height="12" rx="2" fill="none" stroke="#5046E5" strokeWidth="1.8"/></svg>
          <span style={{ fontSize: 12, color: '#5046E5', fontWeight: 600 }}>Zoom sessions only</span>
        </div>
      </div>

      {/* ── MONTH VIEW ──────────────────────────────────── */}
      {viewMode === 'Month' && (
        <div className="card-flat" style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: '1px solid #F3F4F6' }}>
            {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
              <div key={d} style={{ textAlign: 'center', padding: '10px 0', fontSize: 10.5, fontWeight: 700, color: '#9CA3AF', letterSpacing: '0.07em', textTransform: 'uppercase' }}>{d}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
            {Array.from({ length: currentDate.startOf('month').weekday % 7 }, (_, i) => (
              <div key={`e${i}`} style={{ borderRight: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6', minHeight: 100 }} />
            ))}
            {days.map(day => {
              const dayB = getBookingsForDay(day)
              const isToday = day.hasSame(DateTime.now(), 'day')
              return (
                <div key={day.toISO()} style={{ padding: 6, borderRight: '1px solid #F3F4F6', borderBottom: '1px solid #F3F4F6', minHeight: 100, background: isToday ? '#F5F3FF' : undefined }}>
                  <div
                    onClick={() => { setSelectedSlot({ date: day.toFormat('yyyy-MM-dd'), hour: 10 }); setShowModal(true) }}
                    style={{ width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', fontSize: 13, fontWeight: 700, background: isToday ? '#5046E5' : 'transparent', color: isToday ? '#fff' : '#6B7280', cursor: 'pointer', marginBottom: 4 }}>
                    {day.day}
                  </div>
                  {dayB.slice(0, 2).map((b: any, i: number) => (
                    <div key={b.id} style={{ fontSize: 10.5, padding: '2px 6px', borderRadius: 5, marginBottom: 2, background: `${agentColor(b.agent?.name, i)}15`, color: agentColor(b.agent?.name, i), fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {DateTime.fromISO(b.startUtc).setZone(IST_TIMEZONE).toFormat('h:mma')} {b.agent?.name}
                    </div>
                  ))}
                  {dayB.length > 2 && <p style={{ fontSize: 10, color: '#9CA3AF' }}>+{dayB.length - 2} more</p>}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── DAY / WEEK VIEW ─────────────────────────────── */}
      {(viewMode === 'Day' || viewMode === 'Week') && (
        <div className="card-flat" style={{ overflow: 'hidden', flex: 1 }}>
          <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 360px)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: `60px repeat(${days.length},1fr)`, minWidth: viewMode === 'Week' ? 820 : 400 }}>
              {/* Column headers */}
              <div style={{ background: '#FAFAFA', borderBottom: '1px solid #F3F4F6', borderRight: '1px solid #F3F4F6' }} />
              {days.map(d => {
                const isToday = d.hasSame(DateTime.now(), 'day')
                const dayB = getBookingsForDay(d)
                return (
                  <div key={d.toISO()} style={{ textAlign: 'center', padding: '10px 4px', borderBottom: '1px solid #F3F4F6', borderRight: '1px solid #F3F4F6', background: isToday ? '#F5F3FF' : '#FAFAFA' }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: isToday ? '#5046E5' : '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{d.toFormat('EEE')}</p>
                    <p style={{ fontSize: 20, fontWeight: 800, color: isToday ? '#5046E5' : '#0A0A12', letterSpacing: '-0.5px' }}>{d.toFormat('d')}</p>
                    {dayB.filter((b: any) => b.status !== 'cancelled').length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginTop: 3 }}>
                        {dayB.filter((b: any) => b.status !== 'cancelled').slice(0, 4).map((b: any, i: number) => (
                          <div key={b.id} style={{ width: 5, height: 5, borderRadius: '50%', background: agentColor(b.agent?.name, i) }} />
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Hour rows */}
              {hours.map(hour => {
                const istLabel  = DateTime.fromObject({ hour }, { zone: IST_TIMEZONE }).toFormat('h a')
                const userLabel = DateTime.fromObject({ hour }, { zone: IST_TIMEZONE }).setZone(userTz).toFormat('h a')
                const isNow     = DateTime.now().setZone(IST_TIMEZONE).hour === hour

                return (
                  <>
                    {/* Time label column */}
                    <div key={`lbl-${hour}`} style={{ padding: '4px 6px 4px 4px', textAlign: 'right', borderBottom: '1px solid #F3F4F6', borderRight: '1px solid #F3F4F6', background: isNow ? '#F5F3FF' : '#FAFAFA', minHeight: 60 }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: isNow ? '#5046E5' : '#9CA3AF', fontFamily: 'monospace' }}>{istLabel}</p>
                      <p style={{ fontSize: 9, color: '#C4C9D4', fontFamily: 'monospace' }}>{userLabel}</p>
                    </div>

                    {/* Day cells */}
                    {days.map(day => {
                      const slotB   = getBookingsForSlot(day, hour)
                      const isNowSlot = day.hasSame(DateTime.now(), 'day') && isNow
                      return (
                        <div
                          key={`${day.toISO()}-${hour}`}
                          onClick={() => { if (slotB.filter((b: any) => b.status !== 'cancelled').length === 0) { setSelectedSlot({ date: day.toFormat('yyyy-MM-dd'), hour }); setShowModal(true) } }}
                          style={{
                            padding: 4,
                            borderBottom: '1px solid #F3F4F6',
                            borderRight: '1px solid #F3F4F6',
                            minHeight: 60,
                            background: isNowSlot ? 'rgba(80,70,229,0.04)' : undefined,
                            cursor: slotB.filter((b: any) => b.status !== 'cancelled').length === 0 ? 'pointer' : 'default',
                            transition: 'background 0.1s',
                          }}
                          onMouseEnter={e => { if (slotB.length === 0) (e.currentTarget as HTMLElement).style.background = '#F9F8FF' }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = isNowSlot ? 'rgba(80,70,229,0.04)' : '' }}
                        >
                          {slotB.map((b: any) => (
                            <BookingCard key={b.id} b={b} onCancel={() => handleCancel(b.bookingId)} />
                          ))}
                        </div>
                      )
                    })}
                  </>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Booking modal ───────────────────────────────── */}
      {showModal && selectedSlot && (
        <BookingModal
          slot={selectedSlot}
          userTz={userTz}
          onClose={() => setShowModal(false)}
          onBooked={() => { mutate(); setShowModal(false) }}
        />
      )}
    </div>
  )
}

// ── Booking modal component ───────────────────────────────────────
function BookingModal({ slot, userTz, onClose, onBooked }: {
  slot: { date: string; hour: number }
  userTz: string
  onClose: () => void
  onBooked: () => void
}) {
  const [loading, setLoading]       = useState(false)
  const [agentId, setAgentId]       = useState('')
  const [zoomAccount, setZoomAccount] = useState<'account1' | 'account2'>('account1')
  const [title, setTitle]           = useState('')
  const [duration, setDuration]     = useState(60)
  const [studentName, setStudentName] = useState('')
  const [studentEmail, setStudentEmail] = useState('')
  const [notes, setNotes]           = useState('')

  const { data: agents }    = useSWR<any[]>('/api/agents', fetcher)
  const { data: zoomConfig } = useSWR('/api/zoom', fetcher)

  const startDt = DateTime.fromObject(
    { year: parseInt(slot.date.split('-')[0]), month: parseInt(slot.date.split('-')[1]), day: parseInt(slot.date.split('-')[2]), hour: slot.hour },
    { zone: IST_TIMEZONE }
  )
  const endDt = startDt.plus({ minutes: duration })
  const userTime = startDt.setZone(userTz).toFormat('hh:mm a ZZZZ')

  async function handleBook() {
    if (!agentId) { toast.error('Please select an agent'); return }
    if (!title)   { toast.error('Please enter a title or ticket reference'); return }
    setLoading(true)

    const res = await fetch('/api/calendar/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId, title, notes, zoomAccount,
        studentName: studentName || null,
        studentEmail: studentEmail || null,
        startUtc: startDt.toUTC().toISO(),
        endUtc:   endDt.toUTC().toISO(),
      }),
    })

    const data = await res.json()
    setLoading(false)

    if (res.status === 409) { toast.error(data.error || 'Booking conflict'); return }
    if (!res.ok)            { toast.error('Booking failed'); return }

    toast.success('Session booked! Zoom details attached.')
    onBooked()
  }

  const acc1Name = zoomConfig?.account1?.name || 'Zoom Room 1'
  const acc2Name = zoomConfig?.account2?.name || 'Zoom Room 2'
  const acc1Ok   = zoomConfig?.account1?.configured ?? false
  const acc2Ok   = zoomConfig?.account2?.configured ?? false

  return (
    <div className="modal-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="modal-box" style={{ maxWidth: 500 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 22 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#0A0A12', letterSpacing: '-0.5px' }}>Book Zoom Session</h2>
            <p style={{ fontSize: 12.5, color: '#9CA3AF', marginTop: 3 }}>
              {startDt.toFormat('EEEE, dd MMM yyyy')} · {startDt.toFormat('hh:mm a')} IST
            </p>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: 8, background: '#F3F4F6', border: 'none', cursor: 'pointer', fontSize: 16, color: '#6B7280', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Agent */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Support Agent *</label>
            <select className="input-field" value={agentId} onChange={e => setAgentId(e.target.value)}>
              <option value="">Select agent…</option>
              {agents?.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>

          {/* Zoom room selection */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Zoom Room *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {([['account1', acc1Name, acc1Ok], ['account2', acc2Name, acc2Ok]] as [string, string, boolean][]).map(([val, name, ok]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setZoomAccount(val as 'account1' | 'account2')}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 10,
                    border: `2px solid ${zoomAccount === val ? '#5046E5' : '#E5E7EB'}`,
                    background: zoomAccount === val ? '#EEF2FF' : '#FAFAFA',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill={zoomAccount === val ? '#5046E5' : '#9CA3AF'}><path d="M4 6h16v12H4z" opacity=".2"/><path d="M15 10l5-3v10l-5-3v-4z"/><rect x="3" y="6" width="12" height="12" rx="2" fill="none" stroke={zoomAccount === val ? '#5046E5' : '#9CA3AF'} strokeWidth="2"/></svg>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: zoomAccount === val ? '#4338CA' : '#374151' }}>{name}</span>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 600, color: ok ? '#16A34A' : '#DC2626' }}>
                    {ok ? '✓ Configured' : '⚠ Setup needed'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Title / Ticket Reference *</label>
            <input className="input-field" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. TKT-00123 — Math class support" />
          </div>

          {/* Duration */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Duration</label>
            <select className="input-field" value={duration} onChange={e => setDuration(parseInt(e.target.value))}>
              <option value={30}>30 minutes</option>
              <option value={60}>1 hour</option>
              <option value={90}>1.5 hours</option>
              <option value={120}>2 hours</option>
            </select>
          </div>

          {/* Student details */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Student Name</label>
              <input className="input-field" value={studentName} onChange={e => setStudentName(e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Student Email</label>
              <input className="input-field" type="email" value={studentEmail} onChange={e => setStudentEmail(e.target.value)} placeholder="Optional" />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, color: '#6B7280', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Notes</label>
            <textarea className="input-field" value={notes} onChange={e => setNotes(e.target.value)} style={{ height: 60, resize: 'none' }} placeholder="Any additional notes…" />
          </div>

          {/* Time summary */}
          <div style={{ background: '#F5F3FF', borderRadius: 10, padding: '12px 16px', border: '1px solid #DDD6FE' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {[
                { label: 'IST (Team)', value: `${startDt.toFormat('hh:mm a')} – ${endDt.toFormat('hh:mm a')}` },
                { label: 'UTC',        value: `${startDt.toUTC().toFormat('hh:mm a')} – ${endDt.toUTC().toFormat('hh:mm a')}` },
                { label: 'Student TZ', value: userTime },
              ].map(s => (
                <div key={s.label}>
                  <p style={{ fontSize: 10, fontWeight: 700, color: '#7C3AED', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{s.label}</p>
                  <p style={{ fontSize: 11.5, fontWeight: 700, color: '#0A0A12', marginTop: 3 }}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
          <button onClick={onClose} className="btn btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button onClick={handleBook} disabled={loading} className="btn btn-primary" style={{ flex: 2 }}>
            {loading ? 'Booking…' : '🎥 Book & Get Zoom Link'}
          </button>
        </div>
      </div>
    </div>
  )
}
