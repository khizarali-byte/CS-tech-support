'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { WORLD_TIMEZONES } from '@/lib/constants'

export default function NewUserPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'teacher',
    location: '',
    timezone: 'Asia/Kolkata',
  })

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setLoading(false)
    if (res.ok) {
      const user = await res.json()
      toast.success(`User created: ${user.userId}`)
      router.push('/users')
    } else {
      toast.error('Failed to create user')
    }
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
        <h1 className="text-2xl font-bold text-gray-900">Add User</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Full Name *</label>
          <input name="name" value={form.name} onChange={handleChange} required className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Role *</label>
          <select name="role" value={form.role} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            <option value="teacher">Teacher</option>
            <option value="student_parent">Student / Parent</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">ID will be auto-generated as TCH-XXXX or STU-XXXX</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
          <input name="location" value={form.location} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" placeholder="e.g. London, UK" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Timezone</label>
          <select name="timezone" value={form.timezone} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm">
            {WORLD_TIMEZONES.map(tz => <option key={tz.value} value={tz.value}>{tz.label}</option>)}
          </select>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => router.back()} className="flex-1 border border-gray-300 rounded-lg py-2 text-sm">Cancel</button>
          <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium disabled:opacity-50 hover:bg-indigo-700">
            {loading ? 'Creating...' : 'Create User'}
          </button>
        </div>
      </form>
    </div>
  )
}
