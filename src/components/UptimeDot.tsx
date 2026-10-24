import { formatCheckedAt, uptimeFor, uptimeLabels, uptimeMeaning } from '../lib/uptime'
import '../features.css'

/** A status dot and word for one project, as of the last build. */
export default function UptimeDot({ id, title }: { id: string; title: string }) {
  const { status } = uptimeFor(id)
  const checked = formatCheckedAt()
  const label = uptimeLabels[status]
  const detail = `${title}: ${uptimeMeaning[status]}${checked ? `. Checked ${checked}` : ''}`
  return (
    <span className={`uptime uptime-${status}`} title={detail}>
      <span className="uptime-dot" aria-hidden="true" />
      <span className="uptime-label">{label}</span>
      <span className="sr-only">{`. ${detail}`}</span>
    </span>
  )
}
