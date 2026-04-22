'use client'
import { signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { DateTime } from 'luxon'
import { IST_TIMEZONE } from '@/lib/constants'

export function TopBar({ agentName }: { agentName: string }) {
  const [istTime, setIstTime] = useState('')
  const [istDate, setIstDate] = useState('')

  useEffect(() => {
    const tick = () => {
      const now = DateTime.now().setZone(IST_TIMEZONE)
      setIstTime(now.toFormat('HH:mm:ss'))
      setIstDate(now.toFormat('EEE, dd MMM'))
    }
    tick()
    const t = setInterval(tick, 1000)
    return () => clearInterval(t)
  }, [])

  const initials = agentName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <header style={{
      background: 'rgba(10,10,10,0.95)',
      borderBottom: '1px solid rgba(255,255,255,0.07)',
      height: 58,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 28px',
      flexShrink: 0,
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      zIndex: 10,
      position: 'relative',
    }}>
      {/* Bottom border accent */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(255,214,0,0.18), rgba(255,140,0,0.12), transparent)',
      }} />

      {/* Left: IST clock */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '7px 14px',
          background: 'rgba(255,214,0,0.06)',
          borderRadius: 10,
          border: '1px solid rgba(255,214,0,0.14)',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#FFD600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          <div>
            <p style={{
              fontFamily: 'ui-monospace, monospace',
              fontWeight: 700,
              fontSize: 13,
              color: '#FFD600',
              lineHeight: 1,
              letterSpacing: '0.05em',
            }}>
              {istTime}
            </p>
            <p style={{ fontSize: 9.5, color: 'rgba(255,214,0,0.5)', fontWeight: 600, marginTop: 2, letterSpacing: '0.04em' }}>
              {istDate} · IST
            </p>
          </div>
        </div>

        {/* Live badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '5px 12px',
          background: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 99,
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#22C55E',
            boxShadow: '0 0 8px rgba(34,197,94,0.8)',
            display: 'inline-block',
            animation: 'pulse-ring 2s infinite',
          }} />
          <span style={{ fontSize: 10.5, fontWeight: 700, color: '#22C55E', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Live
          </span>
        </div>
      </div>

      {/* Right: agent + sign out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: '#FFD600',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 800, color: '#000',
            boxShadow: '0 0 14px rgba(255,214,0,0.3)',
            letterSpacing: '0.03em', flexShrink: 0,
          }}>{initials}</div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2, letterSpacing: '-0.1px' }}>
              {agentName}
            </p>
            <p style={{ fontSize: 10.5, color: 'rgba(255,214,0,0.6)', fontWeight: 600, marginTop: 1 }}>
              Support Agent
            </p>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, height: 28, background: 'rgba(255,255,255,0.08)' }} />

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="btn btn-danger"
          style={{ padding: '6px 14px', fontSize: 12 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
          </svg>
          Sign out
        </button>
      </div>
    </header>
  )
}
