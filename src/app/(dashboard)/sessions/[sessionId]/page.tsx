'use client'
import useSWR from 'swr'
import { useParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { SESSION_TYPE_LABELS, WORLD_TIMEZONES } from '@/lib/constants'
import { fromISTtoUTC } from '@/lib/timezone'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const router = useRouter()
  const { data: session, isLoading, mutate } = useSWR(`/api/sessions/${sessionId}`, fetcher)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<any>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (session && !session.error) {
      setForm({
        status: session.status,
        rootCause: session.rootCause || '',
        resolution: session.resolution || '',
        issueFoundDuringSession: session.issueFoundDuringSession || '',
        zoomRecordingUrl: session.zoomRecordingUrl || '',
        sessionDate: session.sessionDate ? new Date(session.sessionDate).toISOString().split('T')[0] : '',
        sessionTimingIst: session.sessionTimingIst || '',
        userTimezone: session.userTimezone || 'Asia/Kolkata',
      })
    }
  }, [session])

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSave() {
    setSaving(true)
    let sessionTimingUtc: string | undefined
    let sessionTimingUser: string | undefined

    if (form.sessionDate && form.sessionTimingIst) {
      const utc = fromISTtoUTC(form.sessionDate, form.sessionTimingIst)
      sessionTimingUtc = utc.toISO() || undefined
      if (form.userTimezone) {
        sessionTimingUser = utc.setZone(form.userTimezone).toFormat('dd MMM yyyy, hh:mm a ZZZZ')
      }
    }

    const res = await fetch(`/api/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...form,
        sessionDate: form.sessionDate ? new Date(form.sessionDate).toISOString() : undefined,
        sessionTimingUtc,
        sessionTimingUser,
      }),
    })

    setSaving(false)
    if (res.ok) {
      toast.success('Session updated')
      setEditing(false)
      mutate()
    } else {
      toast.error('Update failed')
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this session?')) return
    await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' })
    toast.success('Deleted')
    router.push('/sessions')
  }

  if (isLoading) return <div className="flex items-center justify-center h-64 text-gray-400">Loading...</div>
  if (!session || session.error) return <div className="text-center py-12 text-gray-400">Session not found</div>

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
          <h1 className="text-2xl font-bold text-gray-900">{session.sessionId}</h1>
          <StatusBadge status={session.status} />
        </div>
        <div className="flex gap-2">
          {!editing ? (
            <button onClick={() => setEditing(true)} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Edit</button>
          ) : (
            <>
              <button onClick={() => setEditing(false)} className="border border-gray-300 px-4 py-2 rounded-lg text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-indigo-700">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </>
          )}
          <button onClick={handleDelete} className="text-red-600 hover:text-red-700 text-sm px-3">Delete</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Issue Details</h2>
            <dl className="space-y-3">
              {session.issueType && <div><dt className="text-xs text-gray-500">Issue Type</dt><dd className="text-sm text-gray-800 mt-0.5">{session.issueType.replace(/_/g, ' ')}</dd></div>}
              {editing ? (
                <>
                  <div>
                    <dt className="text-xs text-gray-500 mb-1">Root Cause</dt>
                    <textarea name="rootCause" value={form.rootCause} onChange={handleChange} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" />
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 mb-1">Resolution</dt>
                    <textarea name="resolution" value={form.resolution} onChange={handleChange} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none" />
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 mb-1">Zoom Recording URL</dt>
                    <input name="zoomRecordingUrl" value={form.zoomRecordingUrl} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                  </div>
                </>
              ) : (
                <>
                  {session.rootCause && <div><dt className="text-xs text-gray-500">Root Cause</dt><dd className="text-sm text-gray-800 mt-0.5">{session.rootCause}</dd></div>}
                  {session.resolution && <div><dt className="text-xs text-gray-500">Resolution</dt><dd className="text-sm text-gray-800 mt-0.5">{session.resolution}</dd></div>}
                  {session.zoomRecordingUrl && (
                    <div>
                      <dt className="text-xs text-gray-500">Zoom Recording</dt>
                      <dd className="mt-0.5"><a href={session.zoomRecordingUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-sm">{session.zoomRecordingUrl}</a></dd>
                    </div>
                  )}
                </>
              )}
            </dl>
          </div>

          {editing && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Timing (IST-based, auto-converts)</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                  <input type="date" name="sessionDate" value={form.sessionDate} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Time IST (24h)</label>
                  <input type="time" name="sessionTimingIst" value={form.sessionTimingIst} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1">User Timezone</label>
                  <select name="userTimezone" value={form.userTimezone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                    {WORLD_TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {editing ? (
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-800 mb-3">Status</h3>
              <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
                <option value="open">Open</option>
                <option value="woc">WOC</option>
                <option value="woi">WOI</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          ) : null}

          <div className="bg-white rounded-xl shadow-sm p-5">
            <h3 className="font-semibold text-gray-800 mb-3">Session Info</h3>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-gray-500">Type</dt><dd className="text-gray-800">{SESSION_TYPE_LABELS[session.sessionType] || session.sessionType}</dd></div>
              <div><dt className="text-gray-500">Agent</dt><dd className="text-gray-800">{session.agent?.name}</dd></div>
              {session.studentId && <div><dt className="text-gray-500">Student ID</dt><dd className="font-mono text-xs text-indigo-600">{session.studentId}</dd></div>}
              {session.studentName && <div><dt className="text-gray-500">Student Name</dt><dd className="text-gray-800">{session.studentName}</dd></div>}
              {session.studentEmail && <div><dt className="text-gray-500">Student Email</dt><dd className="text-gray-800">{session.studentEmail}</dd></div>}
              {session.duration && <div><dt className="text-gray-500">Duration</dt><dd className="text-gray-800">{session.duration} min</dd></div>}
              {session.sessionTimingIst && <div><dt className="text-gray-500">Timing (IST)</dt><dd className="text-gray-800">{session.sessionTimingIst}</dd></div>}
              {session.sessionTimingUser && <div><dt className="text-gray-500">Timing (User TZ)</dt><dd className="text-gray-800">{session.sessionTimingUser}</dd></div>}
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
