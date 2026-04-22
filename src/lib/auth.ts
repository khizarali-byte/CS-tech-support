import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { logActivity } from './activity'

// Gmail addresses for each team member (set in .env.local)
const TEAM_GMAIL: Record<string, string> = {
  'Khizar Ali': process.env.AGENT_GMAIL_KHIZAR  || '',
  'Pradeep':    process.env.AGENT_GMAIL_PRADEEP || '',
  'Srijan':     process.env.AGENT_GMAIL_SRIJAN  || '',
  'Yashika':    process.env.AGENT_GMAIL_YASHIKA || '',
}

// Managers — allowed to log in and view but are not agents
const MANAGER_GMAILS = [
  process.env.AGENT_GMAIL_PRANJAL || '',
  process.env.AGENT_GMAIL_DIVYA   || '',
].filter(Boolean)

const ALLOWED_GMAILS = new Set([...Object.values(TEAM_GMAIL), ...MANAGER_GMAILS].filter(Boolean))

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email:    { label: 'Email',    type: 'email'    },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        const agent = await prisma.agent.findUnique({ where: { email: credentials.email } })
        if (!agent?.passwordHash) return null
        const valid = await bcrypt.compare(credentials.password, agent.passwordHash)
        if (!valid) return null
        return { id: agent.id, name: agent.name, email: agent.email }
      },
    }),
  ],
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  events: {
    async signIn({ user }) {
      if (!user?.name) return
      await logActivity({
        agentId: user.id, agentName: user.name,
        action: 'LOGIN', entity: 'auth',
        entityLabel: `${user.name} signed in`,
      })
      // Create / update login session for heartbeat tracking
      const existing = await prisma.loginSession.findFirst({
        where: { agentId: user.id },
        orderBy: { lastSeen: 'desc' },
      })
      if (existing) {
        await prisma.loginSession.update({
          where: { id: existing.id },
          data: { loginAt: new Date(), lastSeen: new Date() },
        })
      } else {
        await prisma.loginSession.create({
          data: { agentId: user.id, agentName: user.name },
        })
      }
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        return ALLOWED_GMAILS.has(user.email ?? '')
      }
      return true
    },
    async jwt({ token, user, account }) {
      if (user) token.id = user.id
      // For Google sign-in: resolve the agent ID by matching Gmail → agent name → DB record
      if (account?.provider === 'google' && token.email) {
        const agentName = Object.keys(TEAM_GMAIL).find(
          name => TEAM_GMAIL[name] === token.email
        )
        if (agentName) {
          const agent = await prisma.agent.findFirst({ where: { name: agentName } })
          if (agent) {
            token.id   = agent.id
            token.name = agent.name
          }
        }
      }
      return token
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string
      return session
    },
  },
}
