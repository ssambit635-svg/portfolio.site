/**
 * Uptime snapshot for the projects. The file is written by scripts/check-uptime.mjs
 * at build time (and by the daily scheduled deploy), so this is the status as of the
 * last build, with its time shown on the site. Nothing here calls the network.
 */
import report from '../generated/uptime.json'

export type UptimeState = 'up' | 'slow' | 'sleeping' | 'down' | 'unreachable' | 'unknown'

type Report = { checkedAt: string; results: { id: string; status: UptimeState; code: number | null; ms: number }[] }

const snapshot = report as Report

export const uptimeCheckedAt = snapshot.checkedAt

export const uptimeLabels: Record<UptimeState, string> = {
  up: 'Up',
  slow: 'Slow',
  sleeping: 'Asleep',
  down: 'Down',
  unreachable: 'Unreachable',
  unknown: 'Not checked'
}

/** What each state means, for the tooltip and screen readers. */
export const uptimeMeaning: Record<UptimeState, string> = {
  up: 'responded quickly',
  slow: 'responded, but took more than 3 seconds',
  sleeping: 'free hosting is asleep; the first visit wakes it',
  down: 'returned an error',
  unreachable: 'could not be reached',
  unknown: 'no check has run yet'
}

export function uptimeFor(id: string): { status: UptimeState; ms: number | null } {
  const row = snapshot.results.find(r => r.id === id)
  return row ? { status: row.status, ms: row.ms } : { status: 'unknown', ms: null }
}

/** "24 Oct, 23:26 IST", or null when the snapshot has no time. */
export function formatCheckedAt(iso: string = uptimeCheckedAt): string | null {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  const when = new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  }).format(date)
  return `${when} IST`
}
