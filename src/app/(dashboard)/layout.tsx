import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { Heartbeat } from '@/components/layout/Heartbeat'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0D0D0D', overflow: 'hidden' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <TopBar agentName={session.user?.name || 'Agent'} />
        <main
          className="cyber-bg"
          style={{ flex: 1, overflowY: 'auto', padding: '28px 32px' }}
        >
          <Heartbeat />
          {children}
        </main>
      </div>
    </div>
  )
}
