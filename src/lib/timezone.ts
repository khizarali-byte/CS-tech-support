import { DateTime } from 'luxon'
import { IST_TIMEZONE } from './constants'

export function toIST(utcDate: Date | string): DateTime {
  return DateTime.fromJSDate(new Date(utcDate), { zone: 'utc' }).setZone(IST_TIMEZONE)
}

export function toUserZone(utcDate: Date | string, timezone: string): DateTime {
  return DateTime.fromJSDate(new Date(utcDate), { zone: 'utc' }).setZone(timezone)
}

export function fromISTtoUTC(istDateStr: string, istTimeStr: string): DateTime {
  const combined = `${istDateStr}T${istTimeStr}`
  return DateTime.fromISO(combined, { zone: IST_TIMEZONE }).toUTC()
}

export function formatForDisplay(dt: DateTime): string {
  return dt.toFormat('dd MMM yyyy, hh:mm a ZZZZ')
}

export function getISTOffset(): string {
  return DateTime.now().setZone(IST_TIMEZONE).toFormat('ZZZZ')
}

export function convertTime(
  dateStr: string,
  timeStr: string,
  fromTz: string,
  toTz: string
): string {
  const combined = `${dateStr}T${timeStr}`
  const dt = DateTime.fromISO(combined, { zone: fromTz }).setZone(toTz)
  return dt.toFormat('dd MMM yyyy, hh:mm a ZZZZ')
}

export function isDSTActive(timezone: string): boolean {
  const now = DateTime.now().setZone(timezone)
  const jan = DateTime.fromObject({ month: 1, day: 1 }, { zone: timezone })
  return now.offset !== jan.offset
}

export function getCurrentTimeInZone(timezone: string): string {
  return DateTime.now().setZone(timezone).toFormat('hh:mm a, dd MMM yyyy')
}
