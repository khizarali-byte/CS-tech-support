'use client'
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const form = e.currentTarget
    const email = (form.elements.namedItem('email') as HTMLInputElement).value
    const password = (form.elements.namedItem('password') as HTMLInputElement).value
    const res = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (res?.error) toast.error('Invalid credentials')
    else router.push('/dashboard')
  }

  async function handleGoogleSignIn() {
    setGoogleLoading(true)
    await signIn('google', { callbackUrl: '/dashboard' })
  }

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      background: '#0D0D0D',
      backgroundImage: 'radial-gradient(rgba(255,255,255,0.025) 1px, transparent 1px)',
      backgroundSize: '24px 24px',
    }}>

      {/* ── Left: Form ─────────────────────────────────── */}
      <div style={{
        flex: '0 0 480px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '64px 56px',
        position: 'relative',
        zIndex: 1,
        borderRight: '1px solid rgba(255,255,255,0.07)',
      }}>
        {/* Yellow glow blob */}
        <div style={{
          position: 'absolute', top: '-60px', left: '-60px',
          width: 280, height: 280, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,214,0,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Logo */}
        <div style={{ marginBottom: 44 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 13,
              background: '#FFD600',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: '#000',
              letterSpacing: '-0.5px',
              boxShadow: '0 0 20px rgba(255,214,0,0.3), 0 6px 20px rgba(0,0,0,0.4)',
            }}>CM</div>
            <div>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.2px' }}>
                Cuemath
              </p>
              <p style={{ fontSize: 10.5, color: 'rgba(255,214,0,0.7)', fontWeight: 600, marginTop: 2, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Support Portal
              </p>
            </div>
          </div>

          <h1 style={{
            fontSize: 36, fontWeight: 800, letterSpacing: '-1.5px', lineHeight: 1.1,
            background: 'linear-gradient(135deg, #FFFFFF 0%, #A3A3A3 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Welcome back.
          </h1>
          <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.35)', marginTop: 10, lineHeight: 1.6 }}>
            Sign in to manage sessions, schedules and support.
          </p>
        </div>

        {/* ── Google Sign-In ── */}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '13px 24px',
            background: googleLoading ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.06)',
            color: googleLoading ? 'rgba(255,255,255,0.3)' : '#E2E8F0',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 12,
            fontSize: 14, fontWeight: 600,
            cursor: googleLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: 'inherit',
            width: '100%',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.6-8 19.6-20 0-1.3-.1-2.7-.4-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.1 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5.1l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.5-2.9-11.3-7l-6.5 5C9.7 39.6 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 6l6.2 5.2C40.3 35.5 44 30.2 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          {googleLoading ? 'Redirecting…' : 'Continue with Google'}
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
          <span style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>or sign in with password</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.07)' }} />
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label className="label-sm" style={{ display: 'block', marginBottom: 8 }}>Email Address</label>
            <input name="email" type="email" required placeholder="agent@cuemath.com" className="input-field" />
          </div>
          <div>
            <label className="label-sm" style={{ display: 'block', marginBottom: 8 }}>Password</label>
            <input name="password" type="password" required placeholder="••••••••" className="input-field" />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              padding: '13px 24px',
              background: loading ? 'rgba(255,214,0,0.2)' : '#FFD600',
              color: loading ? 'rgba(255,214,0,0.5)' : '#000',
              border: 'none', borderRadius: 12,
              fontSize: 14, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 0 24px rgba(255,214,0,0.3), 0 4px 20px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease', fontFamily: 'inherit',
            }}
          >
            {loading ? 'Signing in…' : 'Sign in →'}
          </button>
        </form>

        <div style={{
          marginTop: 32, paddingTop: 24,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 6px rgba(34,197,94,0.6)', display: 'inline-block' }} />
          <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.2)', fontWeight: 500 }}>
            Internal use only · Cuemath Support Team
          </p>
        </div>
      </div>

      {/* ── Right: Brand panel ─────────────────────────── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '15%', right: '15%',
          width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,214,0,0.1) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: '20%', left: '10%',
          width: 350, height: 350, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,140,0,0.08) 0%, transparent 70%)',
          filter: 'blur(40px)', pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '64px',
        }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: 99, padding: '7px 16px', marginBottom: 36, width: 'fit-content',
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22C55E', boxShadow: '0 0 8px rgba(34,197,94,0.8)', display: 'inline-block' }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#22C55E', letterSpacing: '0.08em' }}>LIVE SUPPORT ACTIVE</span>
          </div>
          <h2 style={{
            fontSize: 48, fontWeight: 800, letterSpacing: '-2.5px', lineHeight: 1.05,
            marginBottom: 20, maxWidth: 500,
            background: 'linear-gradient(135deg, #FFFFFF 30%, rgba(255,214,0,0.9) 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Helping students<br />succeed, every hour.
          </h2>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, maxWidth: 400 }}>
            Real-time session scheduling, Zoom management, and multi-timezone support — all in one place.
          </p>

          {/* Team avatars */}
          <div style={{ marginTop: 48, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 16 }}>
              Support Team
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              {['Khizar', 'Pradeep', 'Srijan', 'Yashika'].map((name, i) => {
                const colors = ['#FFD600', '#FF8C00', '#22C55E', '#F59E0B']
                return (
                  <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%',
                      background: `${colors[i]}20`,
                      border: `1.5px solid ${colors[i]}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 13, fontWeight: 700, color: colors[i],
                    }}>
                      {name[0]}
                    </div>
                    <p style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)', fontWeight: 500 }}>{name}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}
