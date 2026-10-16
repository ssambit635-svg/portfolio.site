import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import './hero-keyboard.css'

type Key = {
  id: string
  value: string | null
  span?: number
}

type KeyRow = {
  id: string
  top: number
  height: number
  left: number
  width: number
  keys: Key[]
}

type PressedKey = {
  id: string
  left: number
  top: number
  width: number
  height: number
}

const makeKeys = (row: string, values: (string | null)[], spans: number[] = []): Key[] =>
  values.map((value, index) => ({
    id: `${row}-${index}`,
    value,
    span: spans[index] ?? 1,
  }))

// Percentages are measured against the photographed keycaps, not the viewport.
// Wider modifier and space keys use spans to keep the hit areas on the real caps.
const rows: KeyRow[] = [
  {
    id: 'function', top: 0.02, height: 0.12, left: 0.055, width: 0.89,
    keys: makeKeys('fn', Array.from({ length: 14 }, () => null)),
  },
  {
    id: 'number', top: 0.15, height: 0.13, left: 0.025, width: 0.95,
    keys: makeKeys('number', ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', '\b'], [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.8]),
  },
  {
    id: 'letters-top', top: 0.28, height: 0.13, left: 0.055, width: 0.89,
    keys: makeKeys('qwerty', [null, 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'], [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5]),
  },
  {
    id: 'letters-home', top: 0.42, height: 0.14, left: 0.09, width: 0.82,
    keys: makeKeys('home', [null, 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", '\n'], [1.7, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.9]),
  },
  {
    id: 'letters-bottom', top: 0.58, height: 0.16, left: 0.025, width: 0.95,
    keys: makeKeys('bottom', [null, 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', null, null, ' ', null], [2, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.5, 1, 5.5, 1.5]),
  },
]

function keyArea(row: KeyRow, keyIndex: number): PressedKey {
  const totalSpan = row.keys.reduce((sum, key) => sum + (key.span ?? 1), 0)
  const startSpan = row.keys.slice(0, keyIndex).reduce((sum, key) => sum + (key.span ?? 1), 0)
  const span = (row.keys[keyIndex].span ?? 1) / totalSpan
  const start = startSpan / totalSpan
  const inset = span * 0.08

  return {
    id: row.keys[keyIndex].id,
    left: (row.left + (start + inset) * row.width) * 100,
    top: (row.top + row.height * 0.07) * 100,
    width: (span - inset * 2) * row.width * 100,
    height: row.height * 0.86 * 100,
  }
}

function hitAt(x: number, y: number): PressedKey | null {
  const row = rows.find((candidate) => y >= candidate.top && y <= candidate.top + candidate.height)
  if (!row || x < row.left || x > row.left + row.width) return null

  const localX = (x - row.left) / row.width
  const totalSpan = row.keys.reduce((sum, key) => sum + (key.span ?? 1), 0)
  let cursor = 0

  for (let index = 0; index < row.keys.length; index++) {
    const span = (row.keys[index].span ?? 1) / totalSpan
    if (localX >= cursor && localX <= cursor + span) return keyArea(row, index)
    cursor += span
  }
  return null
}

function hitForValue(value: string): PressedKey | null {
  for (const row of rows) {
    const index = row.keys.findIndex((key) => key.value === value)
    if (index >= 0) return keyArea(row, index)
  }
  return null
}

function playNoiseHit(
  context: AudioContext,
  at: number,
  duration: number,
  volume: number,
  highPassHz: number,
  lowPassHz: number,
) {
  const frameCount = Math.max(1, Math.floor(context.sampleRate * duration))
  const buffer = context.createBuffer(1, frameCount, context.sampleRate)
  const samples = buffer.getChannelData(0)

  for (let index = 0; index < frameCount; index++) {
    const time = index / context.sampleRate
    samples[index] = (Math.random() * 2 - 1) * Math.exp(-time * 320)
  }

  const source = context.createBufferSource()
  source.buffer = buffer
  const highPass = context.createBiquadFilter()
  highPass.type = 'highpass'
  highPass.frequency.value = highPassHz
  const lowPass = context.createBiquadFilter()
  lowPass.type = 'lowpass'
  lowPass.frequency.value = lowPassHz
  const envelope = context.createGain()
  envelope.gain.setValueAtTime(volume, at)
  envelope.gain.exponentialRampToValueAtTime(0.0001, at + duration)
  source.connect(highPass).connect(lowPass).connect(envelope).connect(context.destination)
  source.start(at)
  source.stop(at + duration)
}

function playMechanicalClick(context: AudioContext, keyId: string) {
  const now = context.currentTime
  const variation = keyId.charCodeAt(keyId.length - 1) % 5

  // A firm high-frequency downstroke, a short low case resonance, then a softer
  // release tick: the two contacts make it read more like a switch than a beep.
  playNoiseHit(context, now, 0.029, 0.12, 520, 7600)
  playNoiseHit(context, now + 0.064, 0.014, 0.045, 1150, 8200)

  const body = context.createOscillator()
  body.type = 'triangle'
  body.frequency.setValueAtTime(162 + variation * 17, now)
  body.frequency.exponentialRampToValueAtTime(108 + variation * 8, now + 0.052)
  const bodyGain = context.createGain()
  bodyGain.gain.setValueAtTime(0.028, now)
  bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.052)
  body.connect(bodyGain).connect(context.destination)
  body.start(now)
  body.stop(now + 0.058)
}

export default function HeroKeyboard() {
  const [pressedKey, setPressedKey] = useState<PressedKey | null>(null)
  const audioRef = useRef<AudioContext | null>(null)
  const lastSoundAt = useRef(0)
  const resumePending = useRef(false)
  const resumeAttempt = useRef(0)
  const lastKey = useRef<string | null>(null)
  const pressTimer = useRef(0)

  const playClick = (keyId: string, userGesture = false) => {
    try {
      const AudioContextConstructor = window.AudioContext
      if (!AudioContextConstructor) return
      const context = audioRef.current ?? new AudioContextConstructor()
      audioRef.current = context

      const play = () => {
        if (context.state !== 'running') return
        const now = performance.now()
        if (now - lastSoundAt.current < 54) return
        lastSoundAt.current = now
        playMechanicalClick(context, keyId)
      }

      if (context.state === 'running') {
        play()
      } else {
        if (resumePending.current && !userGesture) return
        const attempt = ++resumeAttempt.current
        resumePending.current = true
        void context.resume().then(() => {
          if (attempt !== resumeAttempt.current) return
          resumePending.current = false
          play()
        }).catch(() => {
          if (attempt === resumeAttempt.current) resumePending.current = false
        })
      }
    } catch {
      // The key action still works if Web Audio is unavailable or blocked.
    }
  }

  const press = (hit: PressedKey, force = false) => {
    const isNewKey = hit.id !== lastKey.current
    if (!isNewKey && !force) return
    if (isNewKey) lastKey.current = hit.id

    setPressedKey(hit)
    window.clearTimeout(pressTimer.current)
    pressTimer.current = window.setTimeout(() => setPressedKey(null), 148)
    playClick(hit.id, force)
  }

  const pointerHit = (event: PointerEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect()
    if (!bounds.width || !bounds.height) return null
    const x = (event.clientX - bounds.left) / bounds.width
    const y = (event.clientY - bounds.top) / bounds.height
    return hitAt(x, y)
  }

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'touch') return
    const hit = pointerHit(event)
    if (!hit) {
      lastKey.current = null
      return
    }
    press(hit)
  }

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return
    const hit = pointerHit(event)
    if (!hit) return
    // A real press unlocks audio on browsers that refuse sound from hover alone.
    press(hit, true)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Tab' || event.key === 'Shift' || event.key === 'Control' || event.key === 'Alt') return
    if (event.key === 'Escape') {
      lastKey.current = null
      setPressedKey(null)
      return
    }

    const value = event.key === 'Backspace'
      ? '\b'
      : event.key === 'Enter'
        ? '\n'
        : event.key.length === 1
          ? event.key.toLowerCase()
          : null
    if (value === null) return

    event.preventDefault()
    const hit = hitForValue(value)
    if (hit) press(hit, true)
    else playClick(`physical-${value}`, true)
  }

  const clearPress = () => {
    lastKey.current = null
    window.clearTimeout(pressTimer.current)
    setPressedKey(null)
  }

  const handlePointerLeave = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'touch') {
      // Touch pointers leave as soon as the finger lifts. Let the press animation
      // finish instead of clearing it before the visitor can see the key move.
      lastKey.current = null
      return
    }
    clearPress()
  }

  useEffect(() => () => {
    window.clearTimeout(pressTimer.current)
    void audioRef.current?.close().catch(() => undefined)
  }, [])

  const pressStyle = pressedKey
    ? {
        left: `${pressedKey.left}%`,
        top: `${pressedKey.top}%`,
        width: `${pressedKey.width}%`,
        height: `${pressedKey.height}%`,
      }
    : undefined

  return (
    <button
      type="button"
      className="hero-keyboard"
      aria-label="Interactive keyboard. Move across the pictured keys to feel and hear them press."
      onPointerEnter={() => { lastKey.current = null }}
      onPointerMove={handlePointerMove}
      onPointerDown={handlePointerDown}
      onPointerLeave={handlePointerLeave}
      onBlur={clearPress}
      onKeyDown={handleKeyDown}
    >
      {pressedKey && (
        <>
          <span className="hero-key-socket" style={pressStyle} />
          <span className="hero-key-press" style={pressStyle} />
        </>
      )}
    </button>
  )
}
