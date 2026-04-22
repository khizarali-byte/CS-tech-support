'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  {
    href: '/dashboard', label: 'Dashboard',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>,
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
    href: '/insights', label: 'Insights',
    icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
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
      background: '#0A0A0A',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      height: '100vh',
      position: 'sticky',
      top: 0,
      borderRight: '1px solid rgba(255,255,255,0.07)',
    }}>
      {/* Top brand accent line */}
      <div style={{
        height: 2,
        background: 'linear-gradient(90deg, transparent, #FFD600, #FF8C00, transparent)',
      }} />

      {/* Logo */}
      <div style={{ padding: '22px 18px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: '#FFD600',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 13, fontWeight: 800, color: '#000',
            letterSpacing: '-0.5px',
            boxShadow: '0 0 20px rgba(255,214,0,0.3), 0 4px 14px rgba(0,0,0,0.4)',
            flexShrink: 0,
          }}>CM</div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.2, letterSpacing: '-0.2px' }}>
              Cuemath
            </p>
            <p style={{ fontSize: 10.5, color: 'rgba(255,214,0,0.7)', fontWeight: 600, marginTop: 3, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
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
                color: active ? '#FFD600' : 'rgba(255,255,255,0.4)',
                background: active
                  ? 'rgba(255,214,0,0.1)'
                  : 'transparent',
                border: active
                  ? '1px solid rgba(255,214,0,0.22)'
                  : '1px solid transparent',
                boxShadow: active
                  ? '0 0 16px rgba(255,214,0,0.08)'
                  : 'none',
                position: 'relative',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
                  ;(e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'
                  ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.08)'
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
                  background: '#FFD600',
                  boxShadow: '0 0 8px rgba(255,214,0,0.6)',
                }} />
              )}
              <span style={{
                color: active ? '#FFD600' : 'rgba(255,255,255,0.25)',
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
                  background: '#FFD600',
                  boxShadow: '0 0 8px rgba(255,214,0,0.8)',
                  flexShrink: 0,
                }} />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom divider */}
      <div style={{ margin: '0 16px', height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent)' }} />

      {/* Live status */}
      <div style={{ padding: '14px 14px 20px' }}>
        <div style={{
          background: 'rgba(34,197,94,0.06)',
          border: '1px solid rgba(34,197,94,0.15)',
          borderRadius: 10,
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <span style={{
            width: 8, height: 8, borderRadius: '50%',
            background: '#22C55E',
            boxShadow: '0 0 8px rgba(34,197,94,0.8), 0 0 16px rgba(34,197,94,0.4)',
            display: 'inline-block',
            flexShrink: 0,
            animation: 'pulse-ring 2s infinite',
          }} />
          <div>
            <p style={{ fontSize: 11.5, fontWeight: 700, color: '#22C55E', lineHeight: 1 }}>All systems live</p>
            <p style={{ fontSize: 10, color: 'rgba(34,197,94,0.5)', marginTop: 2 }}>No incidents reported</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
