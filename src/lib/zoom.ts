export interface ZoomAccountConfig {
  name: string
  meetingId: string
  passcode: string
  joinUrl: string
}

export function getZoomConfig(account: 'account1' | 'account2'): ZoomAccountConfig | null {
  const prefix = account === 'account1' ? 'ZOOM_ACCOUNT1' : 'ZOOM_ACCOUNT2'
  const name      = process.env[`${prefix}_NAME`]
  const meetingId = process.env[`${prefix}_MEETING_ID`]
  const passcode  = process.env[`${prefix}_PASSCODE`]
  const joinUrl   = process.env[`${prefix}_JOIN_URL`]

  if (!meetingId || !joinUrl) return null
  return { name: name || account, meetingId: meetingId!, passcode: passcode || '', joinUrl: joinUrl! }
}

export function getZoomConfigBothAccounts(): { account1: ZoomAccountConfig | null; account2: ZoomAccountConfig | null } {
  return { account1: getZoomConfig('account1'), account2: getZoomConfig('account2') }
}

/** Generates a formatted invite message for sharing with students */
export function buildZoomInvite({
  studentName,
  agentName,
  title,
  startIst,
  startUserTz,
  zoom,
}: {
  studentName?: string
  agentName: string
  title: string
  startIst: string
  startUserTz?: string
  zoom: ZoomAccountConfig
}): string {
  const greeting = studentName ? `Hi ${studentName},` : 'Hi,'
  const tzLine = startUserTz ? `\n⏰ Your local time: ${startUserTz}` : ''
  return `${greeting}

Your Zoom session has been scheduled.

📌 Topic: ${title}
🗓️ Time (IST): ${startIst}${tzLine}

🔗 Join Zoom Meeting:
${zoom.joinUrl}

📋 Meeting ID: ${zoom.meetingId}
🔑 Passcode: ${zoom.passcode}

Please join 2 minutes before the session starts.

– ${agentName}
Product & Tech Support`
}
