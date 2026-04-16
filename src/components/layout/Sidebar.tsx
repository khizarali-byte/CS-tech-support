'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  {
    href: '/dashboard', label: 'Dashboard',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
  },
  {
    href: '/tickets', label: 'Tickets',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>,
  },
  {
    href: '/sessions', label: 'Sessions',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
  },
  {
    href: '/calendar', label: 'Calendar',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  },
  {
    href: '/users', label: 'Users',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  },
  {
    href: '/recordings', label: 'Recordings',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>,
  },
  {
    href: '/timezone', label: 'Timezone',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20"/></svg>,
  },
  {
    href: '/activity', label: 'Activity',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside style={{
      width: 240,
      background: 'linear-gradient(180deg, #0A0D1A 0%, #080B14 100%)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100vh',
      position: 'sticky',
      top: 0,
      borderRight: '1px solid rgba(255,255,255,0.06)',
      backgroundImage: `
        linear-gradient(180deg, #0A0D1A 0%, #080B14 100%),
        linear-gradient(rgba(0,212,255,0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,212,255,0.02) 1px, transparent 1px)
      `,
      backgroundBlendMode: 'normal',
    }}>
      {/* Top cyan accent line */}
      <div style={{
        height: 1,
        background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), rgba(124,58,237,0.5), transparent)',
      }} />

      {/* Logo */}
      <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: 'linear-gradient(135deg, #00D4FF 0%, #7C3AED 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: '#000',
            letterSpacing: '-0.5px',
            boxShadow: '0 0 20px rgba(0,212,255,0.35), 0 4px 14px rgba(0,0,0,0.4)',
            flexShrink: 0,
          }}>PT</div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#E2E8F0', lineHeight: 1.2, letterSpacing: '-0.2px' }}>
              Product &amp; Tech
            </p>
            <p style={{ fontSize: 10.5, color: 'rgba(0,212,255,0.6)', fontWeight: 600, marginTop: 3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Live Support 24×7
            </p>
          </div>
        </div>
      </div>

      {/* Nav label */}
      <div style={{ padding: '18px 18px 6px' }}>
        <p style={{ fontSize: 9.5, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Navigation
        </p>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '0 10px', display: 'flex', flexDirection: 'column', gap: 2, overflowY: 'auto' }}>
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                textDecoration: 'none',
                transition: 'all 0.18s ease',
                color: active ? '#00D4FF' : 'rgba(255,255,255,0.4)',
                background: active
                  ? 'linear-gradient(135deg, rgba(0,212,255,0.12) 0%, rgba(0,212,255,0.05) 100%)'
                  : 'transparent',
                border: active
                  ? '1px solid rgba(0,212,255,0.2)'
                  : '1px solid transparent',
                boxShadow: active
                  ? '0 0 16px rgba(0,212,255,0.1), inset 0 1px 0 rgba(0,212,255,0.1)'
                  : 'none',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)'
                  ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)'
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'transparent'
                  ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.4)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'transparent'
                }
              }}
            >
              {/* Active left bar */}
              {active && (
                <span style={{
                  position: 'absolute',
                  left: 0, top: '50%', transform: 'translateY(-50%)',
                  width: 3, height: 20, borderRadius: '0 3px 3px 0',
                  background: 'linear-gradient(180deg, #00D4FF, #7C3AED)',
                  boxShadow: '0 0 8px rgba(0,212,255,0.6)',
                }} />
              )}
              <span style={{
                color: active ? '#00D4FF' : 'rgba(255,255,255,0.25)',
                flexShrink: 0,
                transition: 'color 0.18s ease',
              }}>
                {item.icon}
              </span>
              {item.label}
              {active && (
                <span style={{
                  marginLeft: 'auto',
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#00D4FF',
                  boxShadow: '0 0 8px rgba(0,212,255,0.8)',
                  flexShrink: 0,
                }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom divider */}
      <div style={{ margin: '0 16px', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)' }} />

      {/* Live status */}
      <div style={{ padding: '14px 14px 20px' }}>
        <div style={{
          background: 'rgba(0,255,135,0.06)',
          border: '1px solid rgba(0,255,135,0.15)',
          borderRadius: 10,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#00FF87',
            boxShadow: '0 0 8px rgba(0,255,135,0.8), 0 0 16px rgba(0,255,135,0.4)',
            display: 'inline-block',
            flexShrink: 0,
            animation: 'pulse-ring 2s infinite',
          }} />
          <div>
            <p style={{ fontSize: 11.5, fontWeight: 700, color: '#00FF87', lineHeight: 1 }}>All systems live</p>
            <p style={{ fontSize: 10, color: 'rgba(0,255,135,0.5)', marginTop: 2 }}>No incidents reported</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
