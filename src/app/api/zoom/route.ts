import { NextResponse } from 'next/server'
import { getZoomConfigBothAccounts } from '@/lib/zoom'

// Returns Zoom account names/status (NOT credentials) to the frontend
export async function GET() {
  const { account1, account2 } = getZoomConfigBothAccounts()
  return NextResponse.json({
    account1: account1 ? { name: account1.name, configured: true } : { name: 'Zoom Room 1', configured: false },
    account2: account2 ? { name: account2.name, configured: true } : { name: 'Zoom Room 2', configured: false },
  })
}
