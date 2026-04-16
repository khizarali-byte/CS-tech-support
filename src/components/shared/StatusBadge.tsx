import { STATUS_LABELS, STATUS_DESCRIPTIONS } from '@/lib/constants'

const colors: Record<string, { bg: string; text: string; border: string }> = {
  open:      { bg: 'rgba(77,158,255,0.12)',  text: '#4D9EFF', border: 'rgba(77,158,255,0.25)' },
  woc:       { bg: 'rgba(255,184,0,0.12)',   text: '#FFB800', border: 'rgba(255,184,0,0.25)' },
  woi:       { bg: 'rgba(255,136,0,0.12)',   text: '#FF8800', border: 'rgba(255,136,0,0.25)' },
  closed:    { bg: 'rgba(0,255,135,0.12)',   text: '#00FF87', border: 'rgba(0,255,135,0.25)' },
  booked:    { bg: 'rgba(124,58,237,0.12)',  text: '#A78BFA', border: 'rgba(124,58,237,0.25)' },
  cancelled: { bg: 'rgba(255,61,106,0.12)',  text: '#FF3D6A', border: 'rgba(255,61,106,0.25)' },
}

export function StatusBadge({ status }: { status: string }) {
  const c = colors[status] || { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.4)', border: 'rgba(255,255,255,0.1)' }
  const tooltip = STATUS_DESCRIPTIONS[status] || status
  return (
    <span
      title={tooltip}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 10px',
        borderRadius: 99,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.04em',
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        whiteSpace: 'nowrap',
        cursor: 'default',
        textTransform: 'uppercase',
      }}
    >
      {STATUS_LABELS[status] || status.toUpperCase()}
    </span>
  )
}
