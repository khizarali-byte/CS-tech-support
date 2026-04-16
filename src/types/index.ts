import { Agent, User, Ticket, Session, CalendarBooking, Recording } from '@prisma/client'

export type { Agent, User, Ticket, Session, CalendarBooking, Recording }

export type TicketWithRelations = Ticket & {
  user?: User | null
  sessions?: Session[]
  recordings?: Recording[]
}

export type SessionWithRelations = Session & {
  agent: Agent
  ticket: Ticket
  user: User
}

export type BookingWithRelations = CalendarBooking & {
  agent: Agent
  session?: Session | null
}

export type DashboardStats = {
  openTickets: number
  wocTickets: number
  woiTickets: number
  closedToday: number
  todaysSessions: number
  agentWorkload: { name: string; count: number }[]
  lastSync: string | null
}
