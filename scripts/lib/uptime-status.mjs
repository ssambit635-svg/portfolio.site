// How one HTTP check becomes a status shown next to a project.
//
// Free hosting (Render, Streamlit Cloud and similar) puts an app to sleep after a
// while. The first visit then either waits a long time or gets a 502/503/504 while
// the app starts. That is "asleep", not "down", and it is labelled as such.

export const SLOW_MS = 3000

export function classify({ code, ms, error }) {
  if (error) {
    // A timeout is what a sleeping free host looks like from outside.
    if (error === 'TimeoutError' || error === 'AbortError') return 'sleeping'
    return 'unreachable'
  }
  if (code >= 200 && code < 400) return ms < SLOW_MS ? 'up' : 'slow'
  if (code === 502 || code === 503 || code === 504) return 'sleeping'
  return 'down'
}


export async function checkUrl(url, timeoutMs = 8000) {
  const started = Date.now()
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(timeoutMs),
      headers: { 'user-agent': 'portfolio-uptime-check/1.0' }
    })
    // Drain the body so the connection is released.
    await response.arrayBuffer().catch(() => {})
    const ms = Date.now() - started
    return { code: response.status, ms, status: classify({ code: response.status, ms }) }
  } catch (err) {
    const ms = Date.now() - started
    const error = err?.name ?? 'Error'
    return { code: null, ms, status: classify({ error, ms }) }
  }
}
