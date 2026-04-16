export const TICKET_STATUSES = ['open', 'woc', 'woi', 'closed'] as const
export const SESSION_TYPES = [
  'live_class_support',
  'live_class_monitoring',
  'test_class',
  'no_response',
  'reschedule',
] as const
export const TICKET_SOURCES = ['email_ticket', 'chat_ticket'] as const
export const USER_ROLES = ['teacher', 'student_parent'] as const

export const STATUS_LABELS: Record<string, string> = {
  open:   'Open',
  woc:    'WOC',
  woi:    'WOI',
  closed: 'Closed',
}

// Full descriptions used in tooltips / form dropdowns
export const STATUS_DESCRIPTIONS: Record<string, string> = {
  open:   'Open — active, needs attention',
  woc:    'WOC — Waiting on Customer',
  woi:    'WOI — Waiting on Internal',
  closed: 'Closed — resolved',
}

export const SESSION_TYPE_LABELS: Record<string, string> = {
  live_class_support:    'Live Class Support',
  live_class_monitoring: 'Live Class Monitoring',
  test_class:            'Test Class',
  no_response:           'No Response',
  reschedule:            'Reschedule',
}

export const STATUS_COLORS: Record<string, string> = {
  open:   'bg-blue-100 text-blue-800',
  woc:    'bg-yellow-100 text-yellow-800',
  woi:    'bg-orange-100 text-orange-800',
  closed: 'bg-green-100 text-green-800',
}

export const IST_TIMEZONE = 'Asia/Kolkata'

// ─── Agent names (display only — actual IDs fetched from DB) ────
export const AGENT_NAMES = ['Khizar Ali', 'Pradeep', 'Srijan', 'Yashika'] as const

// ─── World timezones ─────────────────────────────────────────────
export const WORLD_TIMEZONES = [
  { label: 'IST — India (UTC+5:30)',             value: 'Asia/Kolkata' },
  { label: 'UTC — Coordinated Universal Time',   value: 'UTC' },
  { label: 'PKT — Pakistan (UTC+5)',             value: 'Asia/Karachi' },
  { label: 'NPT — Nepal (UTC+5:45)',             value: 'Asia/Kathmandu' },
  { label: 'BST — Bangladesh (UTC+6)',           value: 'Asia/Dhaka' },
  { label: 'LKT — Sri Lanka (UTC+5:30)',         value: 'Asia/Colombo' },
  { label: 'GST — Dubai / UAE (UTC+4)',          value: 'Asia/Dubai' },
  { label: 'AST — Riyadh / Saudi (UTC+3)',       value: 'Asia/Riyadh' },
  { label: 'AST — Kuwait (UTC+3)',               value: 'Asia/Kuwait' },
  { label: 'AST — Qatar (UTC+3)',                value: 'Asia/Qatar' },
  { label: 'MST — Oman (UTC+4)',                 value: 'Asia/Muscat' },
  { label: 'AST — Bahrain (UTC+3)',              value: 'Asia/Bahrain' },
  { label: 'GMT — London / UK',                  value: 'Europe/London' },
  { label: 'CET — Paris / Germany (UTC+1)',      value: 'Europe/Paris' },
  { label: 'MSK — Moscow (UTC+3)',               value: 'Europe/Moscow' },
  { label: 'SGT — Singapore (UTC+8)',            value: 'Asia/Singapore' },
  { label: 'MYT — Kuala Lumpur (UTC+8)',         value: 'Asia/Kuala_Lumpur' },
  { label: 'ICT — Bangkok (UTC+7)',              value: 'Asia/Bangkok' },
  { label: 'HKT — Hong Kong (UTC+8)',            value: 'Asia/Hong_Kong' },
  { label: 'JST — Japan (UTC+9)',                value: 'Asia/Tokyo' },
  { label: 'KST — South Korea (UTC+9)',          value: 'Asia/Seoul' },
  { label: 'AEST — Sydney (UTC+10)',             value: 'Australia/Sydney' },
  { label: 'AEST — Melbourne (UTC+10)',          value: 'Australia/Melbourne' },
  { label: 'AWST — Perth (UTC+8)',               value: 'Australia/Perth' },
  { label: 'NZST — Auckland (UTC+12)',           value: 'Pacific/Auckland' },
  { label: 'EST — New York (UTC-5)',             value: 'America/New_York' },
  { label: 'CST — Chicago (UTC-6)',              value: 'America/Chicago' },
  { label: 'MST — Denver (UTC-7)',               value: 'America/Denver' },
  { label: 'PST — Los Angeles (UTC-8)',          value: 'America/Los_Angeles' },
  { label: 'EST — Toronto / Canada (UTC-5)',     value: 'America/Toronto' },
  { label: 'PST — Vancouver / Canada (UTC-8)',   value: 'America/Vancouver' },
  { label: 'BRT — Brazil (UTC-3)',               value: 'America/Sao_Paulo' },
  { label: 'ART — Argentina (UTC-3)',            value: 'America/Argentina/Buenos_Aires' },
]

// ─── Locations with auto-timezone ────────────────────────────────
// Grouped by region. Used in session form location dropdown.
// When selected, timezone is auto-populated.
export const LOCATIONS: { city: string; country: string; region: string; timezone: string }[] = [
  // India
  { city: 'Mumbai',        country: 'India',        region: 'India',        timezone: 'Asia/Kolkata' },
  { city: 'Delhi',         country: 'India',        region: 'India',        timezone: 'Asia/Kolkata' },
  { city: 'Bangalore',     country: 'India',        region: 'India',        timezone: 'Asia/Kolkata' },
  { city: 'Hyderabad',     country: 'India',        region: 'India',        timezone: 'Asia/Kolkata' },
  { city: 'Chennai',       country: 'India',        region: 'India',        timezone: 'Asia/Kolkata' },
  { city: 'Pune',          country: 'India',        region: 'India',        timezone: 'Asia/Kolkata' },
  { city: 'Kolkata',       country: 'India',        region: 'India',        timezone: 'Asia/Kolkata' },
  { city: 'Ahmedabad',     country: 'India',        region: 'India',        timezone: 'Asia/Kolkata' },
  { city: 'Jaipur',        country: 'India',        region: 'India',        timezone: 'Asia/Kolkata' },
  { city: 'Lucknow',       country: 'India',        region: 'India',        timezone: 'Asia/Kolkata' },
  { city: 'Chandigarh',    country: 'India',        region: 'India',        timezone: 'Asia/Kolkata' },
  { city: 'Surat',         country: 'India',        region: 'India',        timezone: 'Asia/Kolkata' },
  { city: 'Kochi',         country: 'India',        region: 'India',        timezone: 'Asia/Kolkata' },
  { city: 'Indore',        country: 'India',        region: 'India',        timezone: 'Asia/Kolkata' },
  { city: 'Nagpur',        country: 'India',        region: 'India',        timezone: 'Asia/Kolkata' },
  // UAE & Gulf
  { city: 'Dubai',         country: 'UAE',          region: 'Gulf',         timezone: 'Asia/Dubai' },
  { city: 'Abu Dhabi',     country: 'UAE',          region: 'Gulf',         timezone: 'Asia/Dubai' },
  { city: 'Sharjah',       country: 'UAE',          region: 'Gulf',         timezone: 'Asia/Dubai' },
  { city: 'Riyadh',        country: 'Saudi Arabia', region: 'Gulf',         timezone: 'Asia/Riyadh' },
  { city: 'Jeddah',        country: 'Saudi Arabia', region: 'Gulf',         timezone: 'Asia/Riyadh' },
  { city: 'Kuwait City',   country: 'Kuwait',       region: 'Gulf',         timezone: 'Asia/Kuwait' },
  { city: 'Doha',          country: 'Qatar',        region: 'Gulf',         timezone: 'Asia/Qatar' },
  { city: 'Muscat',        country: 'Oman',         region: 'Gulf',         timezone: 'Asia/Muscat' },
  { city: 'Manama',        country: 'Bahrain',      region: 'Gulf',         timezone: 'Asia/Bahrain' },
  // South Asia
  { city: 'Karachi',       country: 'Pakistan',     region: 'South Asia',   timezone: 'Asia/Karachi' },
  { city: 'Lahore',        country: 'Pakistan',     region: 'South Asia',   timezone: 'Asia/Karachi' },
  { city: 'Islamabad',     country: 'Pakistan',     region: 'South Asia',   timezone: 'Asia/Karachi' },
  { city: 'Dhaka',         country: 'Bangladesh',   region: 'South Asia',   timezone: 'Asia/Dhaka' },
  { city: 'Kathmandu',     country: 'Nepal',        region: 'South Asia',   timezone: 'Asia/Kathmandu' },
  { city: 'Colombo',       country: 'Sri Lanka',    region: 'South Asia',   timezone: 'Asia/Colombo' },
  // UK
  { city: 'London',        country: 'UK',           region: 'UK',           timezone: 'Europe/London' },
  { city: 'Manchester',    country: 'UK',           region: 'UK',           timezone: 'Europe/London' },
  { city: 'Birmingham',    country: 'UK',           region: 'UK',           timezone: 'Europe/London' },
  { city: 'Leeds',         country: 'UK',           region: 'UK',           timezone: 'Europe/London' },
  // Europe
  { city: 'Paris',         country: 'France',       region: 'Europe',       timezone: 'Europe/Paris' },
  { city: 'Berlin',        country: 'Germany',      region: 'Europe',       timezone: 'Europe/Berlin' },
  { city: 'Amsterdam',     country: 'Netherlands',  region: 'Europe',       timezone: 'Europe/Amsterdam' },
  // USA
  { city: 'New York',      country: 'USA',          region: 'USA',          timezone: 'America/New_York' },
  { city: 'Boston',        country: 'USA',          region: 'USA',          timezone: 'America/New_York' },
  { city: 'Washington DC', country: 'USA',          region: 'USA',          timezone: 'America/New_York' },
  { city: 'Miami',         country: 'USA',          region: 'USA',          timezone: 'America/New_York' },
  { city: 'Atlanta',       country: 'USA',          region: 'USA',          timezone: 'America/New_York' },
  { city: 'Chicago',       country: 'USA',          region: 'USA',          timezone: 'America/Chicago' },
  { city: 'Houston',       country: 'USA',          region: 'USA',          timezone: 'America/Chicago' },
  { city: 'Dallas',        country: 'USA',          region: 'USA',          timezone: 'America/Chicago' },
  { city: 'Denver',        country: 'USA',          region: 'USA',          timezone: 'America/Denver' },
  { city: 'Los Angeles',   country: 'USA',          region: 'USA',          timezone: 'America/Los_Angeles' },
  { city: 'San Francisco', country: 'USA',          region: 'USA',          timezone: 'America/Los_Angeles' },
  { city: 'Seattle',       country: 'USA',          region: 'USA',          timezone: 'America/Los_Angeles' },
  { city: 'San Jose',      country: 'USA',          region: 'USA',          timezone: 'America/Los_Angeles' },
  // Canada
  { city: 'Toronto',       country: 'Canada',       region: 'Canada',       timezone: 'America/Toronto' },
  { city: 'Ottawa',        country: 'Canada',       region: 'Canada',       timezone: 'America/Toronto' },
  { city: 'Montreal',      country: 'Canada',       region: 'Canada',       timezone: 'America/Toronto' },
  { city: 'Vancouver',     country: 'Canada',       region: 'Canada',       timezone: 'America/Vancouver' },
  { city: 'Calgary',       country: 'Canada',       region: 'Canada',       timezone: 'America/Edmonton' },
  // Australia
  { city: 'Sydney',        country: 'Australia',    region: 'Australia',    timezone: 'Australia/Sydney' },
  { city: 'Melbourne',     country: 'Australia',    region: 'Australia',    timezone: 'Australia/Melbourne' },
  { city: 'Brisbane',      country: 'Australia',    region: 'Australia',    timezone: 'Australia/Brisbane' },
  { city: 'Perth',         country: 'Australia',    region: 'Australia',    timezone: 'Australia/Perth' },
  { city: 'Adelaide',      country: 'Australia',    region: 'Australia',    timezone: 'Australia/Adelaide' },
  // Southeast Asia
  { city: 'Singapore',     country: 'Singapore',    region: 'SE Asia',      timezone: 'Asia/Singapore' },
  { city: 'Kuala Lumpur',  country: 'Malaysia',     region: 'SE Asia',      timezone: 'Asia/Kuala_Lumpur' },
  { city: 'Bangkok',       country: 'Thailand',     region: 'SE Asia',      timezone: 'Asia/Bangkok' },
  { city: 'Jakarta',       country: 'Indonesia',    region: 'SE Asia',      timezone: 'Asia/Jakarta' },
  // East Asia
  { city: 'Hong Kong',     country: 'Hong Kong',    region: 'East Asia',    timezone: 'Asia/Hong_Kong' },
  { city: 'Tokyo',         country: 'Japan',        region: 'East Asia',    timezone: 'Asia/Tokyo' },
  { city: 'Seoul',         country: 'South Korea',  region: 'East Asia',    timezone: 'Asia/Seoul' },
  { city: 'Shanghai',      country: 'China',        region: 'East Asia',    timezone: 'Asia/Shanghai' },
  // New Zealand
  { city: 'Auckland',      country: 'New Zealand',  region: 'Pacific',      timezone: 'Pacific/Auckland' },
]
