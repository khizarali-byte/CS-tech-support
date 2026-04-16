'use client'
import { useState, useEffect } from 'react'
import { DateTime } from 'luxon'
import { WORLD_TIMEZONES, IST_TIMEZONE } from '@/lib/constants'
import { isDSTActive } from '@/lib/timezone'

function getNextDSTTransition(tz: string): { date: string; type: 'start' | 'end' } | null {
  const now = DateTime.now().setZone(tz)
  const currentOffset = now.offset
  for (let i = 1; i <= 365 * 24; i++) {
    const future = now.plus({ hours: i })
    if (future.offset !== currentOffset) {
      const type = future.offset > currentOffset ? 'start' : 'end'
      return { date: future.toFormat('dd MMM yyyy, hh:mm a ZZZZ'), type }
    }
  }
  return null
}

function getDSTInfo(tz: string) {
  const isActive = isDSTActive(tz)
  const transition = getNextDSTTransition(tz)
  const offset = DateTime.now().setZone(tz).toFormat('ZZ')
  return { isActive, transition, offset }
}

export default function TimezonePage() {
  const [clocks, setClocks] = useState<Record<string, string>>({})
  const [date, setDate] = useState(DateTime.now().setZone(IST_TIMEZONE).toFormat('yyyy-MM-dd'))
  const [time, setTime] = useState(DateTime.now().setZone(IST_TIMEZONE).toFormat('HH:mm'))
  const [fromTz, setFromTz] = useState(IST_TIMEZONE)
  const [toTz, setToTz] = useState('America/New_York')
  const [converted, setConverted] = useState<{
    time: string; dstNow: boolean;
    nextTransition: ReturnType<typeof getNextDSTTransition>
  } | null>(null)
  const [activeTab, setActiveTab] = useState<'converter' | 'clocks' | 'dst'>('converter')

  useEffect(() => {
    const update = () => {
      const now: Record<string, string> = {}
      WORLD_TIMEZONES.forEach(({ value }) => {
        now[value] = DateTime.now().setZone(value).toFormat('HH:mm:ss')
      })
      setClocks(now)
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])

  function handleConvert() {
    const combined = `${date}T${time}`
    const dt = DateTime.fromISO(combined, { zone: fromTz }).setZone(toTz)
    setConverted({
      time: dt.toFormat('dd MMM yyyy, HH:mm ZZZZ'),
      dstNow: isDSTActive(toTz),
      nextTransition: getNextDSTTransition(toTz),
    })
  }

  const tabs = ['converter', 'clocks', 'dst'] as const
  const tabLabels = { converter: 'Converter', clocks: 'Live Clocks', dst: 'DST Status' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{
            fontSize: 26, fontWeight: 800, letterSpacing: '-0.8px',
            background: 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Timezone Hub</h1>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
            IST base · 24/7 global coverage · DST auto-handled
          </p>
        </div>
        {/* IST live clock */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 16px', borderRadius: 12,
          background: 'rgba(0,212,255,0.06)',
          border: '1px solid rgba(0,212,255,0.15)',
        }}>
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#00D4FF',
            boxShadow: '0 0 8px rgba(0,212,255,0.8)',
          }} />
          <div>
            <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(0,212,255,0.6)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              IST — No DST
            </p>
            <p style={{
              fontFamily: 'ui-monospace, monospace', fontWeight: 700, fontSize: 14,
              color: '#00D4FF', textShadow: '0 0 12px rgba(0,212,255,0.5)',
            }}>
              {clocks[IST_TIMEZONE] || '--:--:--'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, padding: 4, width: 'fit-content',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 12,
      }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '7px 18px', borderRadius: 8,
              fontSize: 13, fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s ease',
              ...(activeTab === tab
                ? {
                    background: 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(0,212,255,0.1))',
                    color: '#00D4FF',
                    border: '1px solid rgba(0,212,255,0.3)',
                    boxShadow: '0 0 12px rgba(0,212,255,0.15)',
                  }
                : { background: 'transparent', color: 'rgba(255,255,255,0.35)', border: 'none' }),
            }}
          >
            {tabLabels[tab]}
          </button>
        ))}
      </div>

      {/* ── TIME CONVERTER ── */}
      {activeTab === 'converter' && (
        <div className="glass-card" style={{ padding: 28 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0', marginBottom: 20 }}>
            Convert Time Between Zones
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
            <div>
              <label className="label-sm" style={{ display: 'block', marginBottom: 7 }}>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-sm" style={{ display: 'block', marginBottom: 7 }}>Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} className="input-field" />
            </div>
            <div>
              <label className="label-sm" style={{ display: 'block', marginBottom: 7 }}>From Timezone</label>
              <select value={fromTz} onChange={e => setFromTz(e.target.value)} className="input-field">
                {WORLD_TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
              </select>
              {isDSTActive(fromTz) && (
                <p style={{ fontSize: 11, marginTop: 4, color: '#FFB800', fontWeight: 600 }}>DST active in source</p>
              )}
            </div>
            <div>
              <label className="label-sm" style={{ display: 'block', marginBottom: 7 }}>To Timezone</label>
              <select value={toTz} onChange={e => setToTz(e.target.value)} className="input-field">
                {WORLD_TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
              </select>
              {isDSTActive(toTz) && (
                <p style={{ fontSize: 11, marginTop: 4, color: '#FFB800', fontWeight: 600 }}>DST active in target</p>
              )}
            </div>
          </div>

          <button onClick={handleConvert} className="btn btn-primary" style={{ padding: '10px 24px' }}>
            Convert →
          </button>

          {converted && (
            <div style={{
              marginTop: 20, borderRadius: 12, padding: 20,
              background: 'rgba(0,212,255,0.05)',
              border: '1px solid rgba(0,212,255,0.15)',
            }}>
              <p className="label-sm" style={{ marginBottom: 6 }}>Converted Time</p>
              <p style={{
                fontSize: 24, fontWeight: 800, color: '#00D4FF',
                letterSpacing: '-0.5px', textShadow: '0 0 20px rgba(0,212,255,0.4)',
              }}>{converted.time}</p>

              <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '6px 12px', borderRadius: 8,
                  background: converted.dstNow ? 'rgba(255,184,0,0.1)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${converted.dstNow ? 'rgba(255,184,0,0.25)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: converted.dstNow ? '#FFB800' : 'rgba(255,255,255,0.2)' }} />
                  <span style={{ fontSize: 11.5, fontWeight: 600, color: converted.dstNow ? '#FFB800' : 'rgba(255,255,255,0.3)' }}>
                    {converted.dstNow ? 'DST active in target zone' : 'DST not active in target zone'}
                  </span>
                </div>
              </div>

              {converted.nextTransition && (
                <div style={{
                  marginTop: 14, borderRadius: 10, padding: 14,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <p className="label-sm" style={{ marginBottom: 8 }}>Next DST Transition</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 20 }}>{converted.nextTransition.type === 'start' ? '☀️' : '🍂'}</span>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0' }}>
                        {converted.nextTransition.type === 'start' ? 'DST Begins (+1h forward)' : 'DST Ends (-1h back)'}
                      </p>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{converted.nextTransition.date}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 11.5, color: '#FF8800', marginTop: 10, fontWeight: 600 }}>
                    ⚠ Sessions around this date may shift by 1 hour — confirm timing with user.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── LIVE CLOCKS ── */}
      {activeTab === 'clocks' && (
        <div className="glass-card" style={{ padding: 24 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#E2E8F0', marginBottom: 20 }}>Live World Clocks</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {WORLD_TIMEZONES.map((tz) => {
              const dst = isDSTActive(tz.value)
              const offset = DateTime.now().setZone(tz.value).toFormat('ZZ')
              const isIst = tz.value === IST_TIMEZONE
              return (
                <div
                  key={tz.value}
                  style={{
                    borderRadius: 10, padding: 14, transition: 'all 0.2s ease',
                    background: isIst ? 'rgba(0,212,255,0.06)' : 'rgba(255,255,255,0.03)',
                    border: isIst ? '1px solid rgba(0,212,255,0.2)' : '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: isIst ? 'rgba(0,212,255,0.7)' : 'rgba(255,255,255,0.3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tz.label.split('—')[0].trim()}
                    </p>
                    {dst && (
                      <span style={{ fontSize: 9.5, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: 'rgba(255,184,0,0.15)', color: '#FFB800', flexShrink: 0, marginLeft: 4 }}>
                        DST
                      </span>
                    )}
                  </div>
                  <p style={{
                    fontSize: 18, fontWeight: 800,
                    fontFamily: 'ui-monospace, monospace',
                    color: isIst ? '#00D4FF' : '#E2E8F0',
                    textShadow: isIst ? '0 0 12px rgba(0,212,255,0.4)' : 'none',
                  }}>{clocks[tz.value] || '--:--:--'}</p>
                  <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.2)', marginTop: 2, fontFamily: 'ui-monospace, monospace' }}>UTC{offset}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── DST STATUS ── */}
      {activeTab === 'dst' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* IST banner */}
          <div style={{
            borderRadius: 14, padding: 20,
            display: 'flex', alignItems: 'center', gap: 16,
            background: 'rgba(0,212,255,0.06)',
            border: '1px solid rgba(0,212,255,0.15)',
          }}>
            <span style={{ fontSize: 32 }}>🇮🇳</span>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: '#E2E8F0' }}>India Standard Time (IST) — UTC+5:30</p>
              <p style={{ fontSize: 12.5, color: 'rgba(0,212,255,0.6)', marginTop: 4, lineHeight: 1.6 }}>
                India does <strong style={{ color: '#00D4FF' }}>not</strong> observe DST. IST stays fixed year-round. No clock changes for agents.
              </p>
            </div>
          </div>

          {/* What is DST */}
          <div className="glass-card" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#E2E8F0', marginBottom: 16 }}>What is Daylight Saving Time?</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { emoji: '☀️', title: 'DST Starts (Spring)', text: 'Clocks go forward 1 hour. Users are 1 hour closer to IST.' },
                { emoji: '🍂', title: 'DST Ends (Autumn)', text: 'Clocks go back 1 hour. Users are 1 hour further from IST.' },
                { emoji: '⚠️', title: 'Agent Best Practice', text: 'Always confirm times in IST + user\'s local timezone. The app handles DST math automatically.' },
              ].map(item => (
                <div key={item.title} style={{
                  borderRadius: 10, padding: 16,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <p style={{ fontSize: 24, marginBottom: 10 }}>{item.emoji}</p>
                  <p style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', marginBottom: 6 }}>{item.title}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* DST table */}
          <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: '#E2E8F0' }}>DST Status — All User Regions</h3>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 3 }}>Next DST transition for each region</p>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead>
                  <tr>{['Region','Current Time','UTC Offset','DST Now','Next Transition','Impact on IST'].map(h => <th key={h}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {WORLD_TIMEZONES.map((tz) => {
                    const info = getDSTInfo(tz.value)
                    const isIst = tz.value === IST_TIMEZONE
                    const istOffset = 5.5
                    const tzOffsetHours = DateTime.now().setZone(tz.value).offset / 60
                    const diff = (istOffset - tzOffsetHours).toFixed(1)
                    const diffLabel = parseFloat(diff) > 0
                      ? `IST is +${diff}h ahead`
                      : parseFloat(diff) < 0
                      ? `IST is ${Math.abs(parseFloat(diff))}h behind`
                      : 'Same as IST'

                    return (
                      <tr key={tz.value} className="trow" style={isIst ? { background: 'rgba(0,212,255,0.03)' } : {}}>
                        <td>
                          <p style={{ fontSize: 13, fontWeight: 600, color: '#E2E8F0' }}>{tz.label.split('—')[0].trim()}</p>
                          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 1 }}>{tz.value}</p>
                        </td>
                        <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: 13, color: '#E2E8F0' }}>
                          {clocks[tz.value] || '--:--'}
                        </td>
                        <td style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                          UTC{info.offset}
                        </td>
                        <td>
                          {isIst ? (
                            <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 99, fontWeight: 700, background: 'rgba(0,212,255,0.1)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.2)' }}>
                              No DST
                            </span>
                          ) : info.isActive ? (
                            <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 99, fontWeight: 700, background: 'rgba(255,184,0,0.12)', color: '#FFB800', border: '1px solid rgba(255,184,0,0.25)' }}>
                              Active
                            </span>
                          ) : (
                            <span style={{ fontSize: 11, padding: '3px 9px', borderRadius: 99, fontWeight: 700, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
                              Inactive
                            </span>
                          )}
                        </td>
                        <td>
                          {isIst || !info.transition ? (
                            <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 12 }}>—</span>
                          ) : (
                            <div>
                              <span style={{ fontSize: 12, fontWeight: 700, color: info.transition.type === 'start' ? '#00FF87' : '#FF3D6A' }}>
                                {info.transition.type === 'start' ? '☀️ +1h' : '🍂 -1h'}
                              </span>
                              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 2 }}>{info.transition.date}</p>
                            </div>
                          )}
                        </td>
                        <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)' }}>{diffLabel}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
