import { useEffect, useState } from 'react'

/** The time in `tz` as "h:mm AM". */
function formatTime(tz: string): string {
  return new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: tz }).format(new Date())
}

/** The current time in `tz`, refreshed every ten seconds. */
export function useClock(tz: string) {
  const [time, setTime] = useState(() => formatTime(tz))
  useEffect(() => {
    setTime(formatTime(tz))
    const id = setInterval(() => setTime(formatTime(tz)), 10_000)
    return () => clearInterval(id)
  }, [tz])
  return time
}
