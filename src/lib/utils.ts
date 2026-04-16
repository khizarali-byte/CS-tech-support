import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { prisma } from './prisma'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export async function generateTicketId(): Promise<string> {
  const count = await prisma.ticket.count()
  return `TKT-${String(count + 1).padStart(5, '0')}`
}

export async function generateSessionId(): Promise<string> {
  const count = await prisma.session.count()
  return `SES-${String(count + 1).padStart(5, '0')}`
}

export async function generateUserId(role: string): Promise<string> {
  const prefix = role === 'teacher' ? 'TCH' : 'STU'
  const count = await prisma.user.count({ where: { role } })
  return `${prefix}-${String(count + 1).padStart(4, '0')}`
}

export async function generateBookingId(): Promise<string> {
  const count = await prisma.calendarBooking.count()
  return `BKG-${String(count + 1).padStart(5, '0')}`
}

export async function generateRecordingId(): Promise<string> {
  const count = await prisma.recording.count()
  return `REC-${String(count + 1).padStart(5, '0')}`
}
