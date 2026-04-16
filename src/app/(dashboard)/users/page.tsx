'use client'
import useSWR from 'swr'
import Link from 'next/link'
import { useState } from 'react'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export default function UsersPage() {
  const [role, setRole] = useState('')
  const [search, setSearch] = useState('')

  const params = new URLSearchParams()
  if (role) params.set('role', role)
  if (search) params.set('search', search)
  const { data, isLoading } = useSWR(`/api/users?${params}`, fetcher)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{
            fontSize: 26, fontWeight: 800, letterSpacing: '-0.8px',
            background: 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>Users</h1>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.3)', marginTop: 4 }}>
            Teachers &amp; Students/Parents · {data?.length || 0} total
          </p>
        </div>
        <Link href="/users/new" className="btn btn-primary">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add User
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search name, ID, email…"
          className="input-field" style={{ width: 260 }}
        />
        <select className="input-field" style={{ width: 190 }} value={role} onChange={e => setRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="teacher">Teacher</option>
          <option value="student_parent">Student / Parent</option>
        </select>
      </div>

      {/* Table */}
      <div className="glass-card" style={{ overflow: 'hidden', padding: 0 }}>
        {isLoading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ height: 46, borderRadius: 8, background: 'rgba(255,255,255,0.04)', animation: 'pulse 1.4s ease-in-out infinite' }} />
            ))}
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>{['User ID','Name','Role','Location','Timezone','Email',''].map(h => <th key={h}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {(!data || data.length === 0) && (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.2)' }}>No users found</td></tr>
              )}
              {data?.map((u: { id: string; userId: string; name: string; role: string; location?: string; timezone?: string; email?: string }) => (
                <tr key={u.id} className="trow">
                  <td>
                    <span style={{
                      fontFamily: 'ui-monospace, monospace', fontSize: 12.5, fontWeight: 700,
                      color: u.role === 'teacher' ? '#A78BFA' : '#00D4FF',
                      textShadow: u.role === 'teacher' ? '0 0 10px rgba(167,139,250,0.4)' : '0 0 10px rgba(0,212,255,0.4)',
                    }}>{u.userId}</span>
                  </td>
                  <td style={{ fontWeight: 600, color: '#E2E8F0' }}>{u.name}</td>
                  <td>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 99,
                      textTransform: 'uppercase', letterSpacing: '0.04em',
                      ...(u.role === 'teacher'
                        ? { background: 'rgba(124,58,237,0.12)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.25)' }
                        : { background: 'rgba(0,212,255,0.10)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.2)' })
                    }}>
                      {u.role === 'teacher' ? 'Teacher' : 'Student/Parent'}
                    </span>
                  </td>
                  <td style={{ color: 'rgba(255,255,255,0.45)' }}>{u.location || '—'}</td>
                  <td style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'ui-monospace, monospace' }}>{u.timezone || 'Asia/Kolkata'}</td>
                  <td style={{ color: 'rgba(255,255,255,0.45)' }}>{u.email || '—'}</td>
                  <td>
                    <Link href={`/users/${u.userId}`} style={{
                      fontSize: 11.5, fontWeight: 700, color: '#00D4FF',
                      background: 'rgba(0,212,255,0.08)', padding: '5px 12px', borderRadius: 8,
                      textDecoration: 'none', border: '1px solid rgba(0,212,255,0.15)',
                    }}>
                      View →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
