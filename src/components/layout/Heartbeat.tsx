'use client'
import { useEffect } from 'react'

/** Pings /api/activity/heartbeat every 2 minutes so the server knows this agent is online. */
export function Heartbeat() {
  useEffect(() => {
    async function ping() {
      try { await fetch('/api/activity/heartbeat', { method: 'POST' }) } catch {}
    }
    ping() // on mount
    const id = setInterval(ping, 2 * 60 * 1000) // every 2 min
    return () => clearInterval(id)
  }, [])
  return null
}
