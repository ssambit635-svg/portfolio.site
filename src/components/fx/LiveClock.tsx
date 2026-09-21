import { useEffect, useState } from 'react'

/**
 * A live clock for the author's timezone — a small piece of real data that
 * makes the page feel inhabited rather than static.
 */
export function LiveClock({ timeZone = 'Asia/Kolkata', label = 'IST' }: { timeZone?: string; label?: string }) {
  const [time, setTime] = useState(() => format(new Date(), timeZone))
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    let timer = 0
    const tick = () => {
      const now = new Date()
      setTime(format(now, timeZone))
      setPulse(now.getSeconds() % 2 === 0)
      timer = window.setTimeout(tick, 1000 - (now.getMilliseconds() % 1000))
    }
    tick()
    return () => window.clearTimeout(timer)
  }, [timeZone])

  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs text-muted-foreground tabular-nums">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{
          background: 'rgb(226 183 106)',
          boxShadow: '0 0 10px rgb(226 183 106 / 0.8)',
          opacity: pulse ? 1 : 0.45,
          transition: 'opacity 400ms ease-out'
        }}
        aria-hidden="true"
      />
      <span>{time}</span>
      <span className="text-muted-foreground/60">{label}</span>
    </span>
  )
}

function format(date: Date, timeZone: string) {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
      timeZone
    }).format(date)
  } catch {
    return date.toLocaleTimeString()
  }
}
