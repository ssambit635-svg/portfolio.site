import { useEffect, useState } from 'react'

/**
 * Tiny external store for "the preloader has finished".
 * Hero animations wait for this so the opening beat is choreographed
 * instead of racing the loader.
 */
let ready = false
const listeners = new Set<(value: boolean) => void>()

export function setAppReady(value = true) {
  if (ready === value) return
  ready = value
  listeners.forEach((listener) => listener(value))
}

export function isAppReady() {
  return ready
}

export function useAppReady() {
  const [value, setValue] = useState(ready)

  useEffect(() => {
    listeners.add(setValue)
    setValue(ready)
    return () => {
      listeners.delete(setValue)
    }
  }, [])

  return value
}
