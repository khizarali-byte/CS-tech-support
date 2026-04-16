const DOMAIN = process.env.FRESHDESK_DOMAIN
const API_KEY = process.env.FRESHDESK_API_KEY

function headers() {
  const creds = Buffer.from(`${API_KEY}:X`).toString('base64')
  return {
    Authorization: `Basic ${creds}`,
    'Content-Type': 'application/json',
  }
}

export async function fetchEmailTickets(since?: Date) {
  if (!DOMAIN || !API_KEY) return []
  const sinceParam = since ? `&updated_since=${since.toISOString()}` : ''
  const url = `https://${DOMAIN}/api/v2/tickets?per_page=100${sinceParam}&include=requester`
  const res = await fetch(url, { headers: headers() })
  if (!res.ok) throw new Error(`Freshdesk error: ${res.status}`)
  const data = await res.json()
  return data.map((t: any) => ({
    freshdeskId: t.id,
    source: mapSource(t.source),
    subject: t.subject || 'No Subject',
    description: t.description_text,
    status: mapStatus(t.status),
    priority: mapPriority(t.priority),
    freshdeskStatus: t.status,
    requesterEmail: t.requester?.email,
    requesterName: t.requester?.name,
  }))
}

function mapSource(s: number): string {
  const map: Record<number, string> = { 1: 'email_ticket', 2: 'email_ticket', 7: 'chat_ticket' }
  return map[s] || 'email_ticket'
}

function mapStatus(s: number): string {
  const map: Record<number, string> = { 2: 'open', 3: 'woc', 4: 'woi', 5: 'closed' }
  return map[s] || 'open'
}

function mapPriority(p: number): string {
  const map: Record<number, string> = { 1: 'low', 2: 'medium', 3: 'high', 4: 'urgent' }
  return map[p] || 'medium'
}
