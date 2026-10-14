import { useEffect, useRef, useState } from 'react'

/**
 * Emo's senses.
 *
 * He lives inside the hero photograph, so everything he reacts to is a real
 * signal from the page or the device: the pointer, the keyboard under his nose,
 * the scroll fling, the clipboard, the window being resized, the network
 * dropping, the tab going away, the battery, and (opt-in, hold Space) the
 * microphone.
 *
 * He never paints through React. One loop writes numbers as custom properties on
 * his root and flips a single `data-face` attribute, so a pointer move cannot
 * re-render the page. Look lives in emo.css, geometry in lib/emoFace.ts, and the
 * loop stops itself when the hero is off screen or he has nothing left to move.
 *
 * The rule inside: handlers only *record* what the user did; the loop decides
 * what his face does. A pupil that dilates from a pointer event never comes
 * back down.
 */

type Face =
  | 'idle' | 'curious' | 'focused' | 'worried' | 'happy' | 'surprised'
  | 'peek' | 'dizzy' | 'sleep' | 'wake' | 'offline' | 'lowbat' | 'listening' | 'pain'

type Reaction = { face: Face; ms: number; priority: number; say?: string; pin?: boolean }

/** A reaction is a face plus a line of copy. Only a louder one may interrupt. */
const TAPS_TO_HURT = 4
const TAP_WINDOW = 1_000
const REACTIONS: Record<string, Reaction> = {
  poke: { face: 'surprised', ms: 950, priority: 8, say: 'hi.' },
  poke2: { face: 'surprised', ms: 950, priority: 8, say: 'that tickles' },
  poke3: { face: 'worried', ms: 1500, priority: 8, say: 'ok ok i am awake' },
  /* Four taps in a second is not a poke any more. Highest priority next to the network
     outage, because a wince that gets interrupted by a joke is not a wince. */
  ouch: { face: 'pain', ms: 1900, priority: 9, say: 'that hurts', pin: true },
  name: { face: 'happy', ms: 1700, priority: 7, say: 'yes, that is me' },
  copy: { face: 'happy', ms: 1200, priority: 6, say: 'copied — send it' },
  cut: { face: 'worried', ms: 1200, priority: 6, say: 'you cut my snippet' },
  earthquake: { face: 'dizzy', ms: 750, priority: 6, say: 'easy with the walls' },
  typing: { face: 'worried', ms: 1200, priority: 4, say: 'rough one?' },
  devtools: { face: 'peek', ms: 2800, priority: 5, say: 'i saw nothing' },
  offline: { face: 'offline', ms: 0, priority: 9, say: 'network down — i kept your place' },
  online: { face: 'happy', ms: 1600, priority: 5, say: 'back — nothing dropped' },
  wake: { face: 'wake', ms: 1900, priority: 4, say: 'you came back' },
  fling: { face: 'dizzy', ms: 650, priority: 3 },
  micOn: { face: 'listening', ms: 0, priority: 2 },
  micDenied: { face: 'worried', ms: 2000, priority: 7, say: 'no mic, no problem' },
}

type MicState = 'off' | 'ready' | 'hot' | 'blocked'
/** 'na' means this device has nothing to feel with, so his switch stops offering it. */
type MotionState = 'off' | 'on' | 'na'
type BatteryLike = {
  level: number
  charging: boolean
  addEventListener: (type: string, handler: () => void) => void
  removeEventListener: (type: string, handler: () => void) => void
}

const clamp = (v: number, lo = -1, hi = 1) => (v < lo ? lo : v > hi ? hi : v)
const ease = (cur: number, to: number, k: number, dt: number) => cur + (to - cur) * (1 - Math.exp(-k * dt))
const rand = (lo: number, hi: number) => lo + Math.random() * (hi - lo)

export function useEmo() {
  const rootRef = useRef<HTMLDivElement>(null)
  const hitRef = useRef<HTMLButtonElement>(null)
  const hintRef = useRef<HTMLSpanElement>(null)
  const [ui, setUi] = useState<{ mic: MicState; motion: MotionState }>({ mic: 'off', motion: 'off' })
  const api = useRef<{ armMic: () => void; armMotion: () => void } | null>(null)

  useEffect(() => {
    const root = rootRef.current
    const hit = hitRef.current
    const hint = hintRef.current
    if (!root || !hit || !hint) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const set = (name: string, value: number) => root.style.setProperty(name, value.toFixed(4))

    /* --- what the loop owns ------------------------------------------------ */
    let gx = 0, gy = 0, tx = 0, ty = 0            // gaze: smoothed, target
    let pop = 0, squint = 0, converge = 0, lean = 0, tilt = 0, drift = 0
    let blink = -1, nextBlink = performance.now() + rand(1600, 4000), lidHold = 0
    let wobble = 0, shake = 0, voice = 0
    let box = hit.getBoundingClientRect()
    let raf = 0, last = performance.now(), restFrames = 0
    let onScreen = true, hiddenAt = 0, lastInput = performance.now(), scrollY = window.scrollY
    let breath = 0
    let face: Face | '' = ''
    let active: { face: Face; until: number; priority: number } | null = null
    let mic: MicState = 'off'
    let watching = false

    /* --- what the handlers record ----------------------------------------- */
    let pointerDist = 3, pointerTilt = 0, orientX = 0, orientY = 0
    const keys: number[] = []
    const backs: number[] = []
    let typed = ''
    let pokes = Number(sessionStorage.getItem('emo-pokes') ?? 0)

    const show = (next: Face | '') => {
      if (next === face) return
      face = next
      if (next === '') delete root.dataset.face
      else root.dataset.face = next
    }
    let hintTimer = 0
    const say = (text: string, ms = 2600, pin = false) => {
      hint.textContent = text
      root.dataset.hint = '1'
      // The pin rides the same lifetime as the line it belongs to.
      if (pin) root.dataset.pin = '1'
      else delete root.dataset.pin
      // Timed on the clock, not on frames: the loop may well stop before the line is
      // due to leave, and a caption that outlives its own joke is worse than none.
      window.clearTimeout(hintTimer)
      hintTimer = window.setTimeout(() => { delete root.dataset.hint; delete root.dataset.pin }, ms)
      start()
    }
    const look = (x: number, y: number) => { tx = clamp(x); ty = clamp(y) }
    /** Where he is when nothing is asking for his attention. */
    const mood = (): Face => {
      if (navigator.onLine === false) return 'offline'
      const quiet = performance.now() - lastInput
      const hour = new Date().getHours()
      if (quiet > 240_000 || hour < 5 || hour >= 23) return 'sleep'
      if (quiet > 25_000) return 'idle'
      return 'curious'
    }
    const fire = (key: string) => {
      const reaction = REACTIONS[key]
      if (!reaction) return
      if (active && active.priority > reaction.priority && performance.now() < active.until) return
      active = {
        face: reaction.face,
        until: reaction.ms ? performance.now() + reaction.ms : Infinity,
        priority: reaction.priority,
      }
      if (key === 'earthquake') shake = 1
      if (key === 'fling') wobble = 1
      // A flinch from the shoulders, not a jump: the tremor decays in the loop.
      if (key === 'ouch') { wobble = 1.35; shake = 0.75; lidHold = performance.now() }
      if (reaction.say) say(reaction.say, 2600, !!reaction.pin)
      start()
    }
    /* --- pointer: he watches what you watch -------------------------------- */
    // The frame measures him at most once per animation frame: a rect read inside a
    // scroll handler would force layout on every scroll event, on the main thread,
    // while the page is already busy painting the hero.
    let measuredY = NaN
    const measure = () => {
      box = hit.getBoundingClientRect()
      measuredY = window.scrollY
    }
    const onPointerMove = (event: PointerEvent) => {
      lastInput = performance.now()
      const cx = box.left + box.width / 2
      const cy = box.top + box.height * 0.44
      const dx = event.clientX - cx
      const dy = event.clientY - cy
      const span = Math.max(box.width * 3.2, 260)
      look((dx / span) * 2.4, (dy / (span * 0.72)) * 2.4)
      pointerDist = Math.hypot(dx, dy) / (box.width || 1) - 0.5
      pointerTilt = clamp(dx / (window.innerWidth * 0.5))
      start()
    }
    const onPointerOver = (event: Event) => {
      const node = (event.target as Element | null)?.closest?.('a,button,[data-emo-look]')
      if (!node || node.closest('.emo')) return
      const r = node.getBoundingClientRect()
      if (!r.width) return
      const cx = box.left + box.width / 2
      const cy = box.top + box.height * 0.44
      look(((r.left + r.width / 2 - cx) / box.width) * 2.2, ((r.top + r.height / 2 - cy) / box.height) * 1.5)
      lastInput = performance.now()
      pointerDist = 0.4 // leaning on a link counts as standing close
      start()
    }
    // The escalation is about *rate*, not about how many times he has ever been
    // touched: four taps inside a second is a different gesture from four taps spread
    // over a visit, and only the first one hurts.
    const taps: number[] = []
    const poke = () => {
      const now = performance.now()
      // A tap on a phone is a pointerdown with nothing before it — no hover, no move —
      // so this is the only place some visitors ever "arrive".
      lastInput = now
      pokes += 1
      sessionStorage.setItem('emo-pokes', String(pokes))
      taps.push(now)
      while (taps.length && now - (taps[0] ?? 0) > TAP_WINDOW) taps.shift()
      if (taps.length >= TAPS_TO_HURT) {
        taps.length = 0
        fire('ouch')
      } else {
        fire(pokes >= 4 ? 'poke3' : pokes === 2 ? 'poke2' : 'poke')
      }
      pointerTilt = -0.9
    }
    const onPointerDown = poke
    const onClick = (event: MouseEvent) => {
      // A press has already poked him; this is Enter or Space on the focused button.
      if (event.detail === 0) poke()
    }

    /* --- the keyboard under his nose -------------------------------------- */
    const inField = (target: EventTarget | null) => {
      const el = target as HTMLElement | null
      return /^(input|textarea|select)$/i.test(el?.tagName ?? '') || el?.isContentEditable === true
    }
    const onKeyDown = (event: KeyboardEvent) => {
      const field = inField(event.target)
      if (event.key === 'Backspace') {
        backs.push(event.timeStamp)
        while (backs.length && event.timeStamp - (backs[0] ?? 0) > 1300) backs.shift()
        if (backs.length >= 4) fire('typing')
        return
      }
      if (event.key === ' ') {
        if (mic === 'ready' && !field) { event.preventDefault(); void openMic() }
        return
      }
      if (event.key.length !== 1 || field) return
      lastInput = performance.now()
      keys.push(event.timeStamp)
      while (keys.length && event.timeStamp - (keys[0] ?? 0) > 1600) keys.shift()
      typed = (typed + event.key.toLowerCase()).slice(-6)
      if (typed.endsWith('emo')) fire('name')
      start()
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === ' ' && mic === 'hot') { event.preventDefault(); closeMic() }
    }

    /* --- the rest of the room -------------------------------------------- */
    const onCopy = (event: Event) => { lastInput = performance.now(); fire(event.type === 'cut' ? 'cut' : 'copy') }
    let width = window.innerWidth, height = window.innerHeight, resizeAt = 0
    const onResize = () => {
      if (window.innerWidth === width && window.innerHeight === height) return
      width = window.innerWidth; height = window.innerHeight
      measuredY = NaN
      window.clearTimeout(resizeAt)
      resizeAt = window.setTimeout(() => fire('earthquake'), 120)
    }
    const onVisibility = () => {
      if (document.hidden) { hiddenAt = performance.now(); onScreen = false; stop(); closeMic() }
      else {
        onScreen = true
        if (performance.now() - hiddenAt > 20_000) fire('wake')
        start()
      }
    }
    const onScroll = () => { lastInput = performance.now(); start() }
    const onNetwork = () => fire(navigator.onLine === false ? 'offline' : 'online')
    /** Devtools opening is his one rude joke. A heuristic, and deliberately only
     *  on the transition — a panel already open on load would accuse everyone. */
    let devTools = -1
    const devCheck = window.setInterval(() => {
      if (!onScreen || document.hidden) return
      const gap = Math.max(window.outerWidth - window.innerWidth, (window.outerHeight - window.innerHeight) * 0.55)
      const open = window.outerWidth > 0 && gap > 168
      if (devTools === -1) { devTools = open ? 1 : 0; return }
      if (open && devTools === 0) { devTools = 1; fire('devtools') }
      else if (!open && devTools === 1) devTools = 0
    }, 1500)

    /* --- device: battery, tilt, microphone -------------------------------- */
    let battery: BatteryLike | null = null
    const paintPower = () => {
      if (!battery) return
      root.dataset.power = battery.charging ? 'charging' : battery.level <= 0.2 ? 'low' : 'on'
    }
    const onPower = () => { paintPower() }
    const getBattery = (navigator as Navigator & { getBattery?: () => Promise<BatteryLike> }).getBattery
    void getBattery?.call(navigator).then(found => {
      battery = found
      found.addEventListener('levelchange', onPower)
      found.addEventListener('chargingchange', onPower)
      paintPower()
    }).catch(() => { /* no Battery Status API: no charging bolt for him */ })

    /* --- the tilt of the device, when it has one --------------------------- */
    const stopTilt = () => {
      watching = false
      orientX = 0
      orientY = 0
      window.removeEventListener('deviceorientation', onTilt)
    }
    /** He only ever offers the switch again if there is a sensor behind it. */
    const noSensor = () => {
      stopTilt()
      setUi(state => ({ ...state, motion: 'na' }))
      say('nothing to feel with here — cursor only', 2600)
    }
    // A phone answers many times a second, so only a change on the desk is worth
    // waking him for; otherwise he would never settle into a blink.
    const onTilt = (event: DeviceOrientationEvent) => {
      if (!watching) return
      // Browsers with no sensor fire the event with nothing in it.
      if (event.alpha === null && event.beta === null && event.gamma === null) {
        noSensor()
        return
      }
      const x = clamp((event.gamma ?? 0) / 32)
      const y = clamp(((event.beta ?? 45) - 45) / 55)
      if (Math.abs(x - orientX) + Math.abs(y - orientY) < 0.02) return
      orientX = x
      orientY = y
      start()
    }
    const armMotion = () => {
      if (watching) {
        stopTilt()
        setUi(state => ({ ...state, motion: 'off' }))
        say('ok — cursor only', 1800)
        return
      }
      const sensor = (window as unknown as { DeviceOrientationEvent?: { requestPermission?: () => Promise<string> } }).DeviceOrientationEvent
      const bind = () => {
        watching = true
        window.addEventListener('deviceorientation', onTilt, { passive: true })
        setUi(state => ({ ...state, motion: 'on' }))
        say('now i can feel the desk tilt', 2600)
      }
      if (!sensor) {
        noSensor()
        return
      }
      // iOS asks first; everywhere else the listener is the ask.
      if (!sensor.requestPermission) {
        bind()
        return
      }
      void sensor
        .requestPermission()
        .then(state => (state === 'granted' ? bind() : noSensor()))
        .catch(noSensor)
    }

    let stream: MediaStream | null = null
    let audio: AudioContext | null = null
    let analyser: AnalyserNode | null = null
    let samples = new Uint8Array(1024)
    const closeMic = () => {
      stream?.getTracks().forEach(track => track.stop())
      stream = null
      analyser = null
      if (mic === 'hot') { mic = 'ready'; setUi(state => ({ ...state, mic })); breathe() }
      if (active?.priority === REACTIONS.micOn.priority) active = null
    }
    /** Tracks are open only while Space is held — the OS record light goes off the
     *  moment you let go, and nothing is ever buffered, stored or sent. */
    const openMic = async () => {
      if (stream || mic === 'blocked' || !navigator.mediaDevices?.getUserMedia) {
        if (!navigator.mediaDevices?.getUserMedia) { mic = 'blocked'; setUi(state => ({ ...state, mic })) }
        return
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        })
      } catch {
        mic = 'blocked'
        setUi(state => ({ ...state, mic }))
        fire('micDenied')
        return
      }
      audio ??= new AudioContext()
      if (audio.state === 'suspended') void audio.resume()
      analyser = audio.createAnalyser()
      analyser.fftSize = 1024
      analyser.smoothingTimeConstant = 0.55
      const source = audio.createMediaStreamSource(stream)
      source.connect(analyser)
      samples = new Uint8Array(analyser.fftSize)
      mic = 'hot'
      setUi(state => ({ ...state, mic }))
      fire('micOn')
    }
    const armMic = async () => {
      if (mic !== 'off') { mic = 'off'; closeMic(); setUi(state => ({ ...state, mic: 'off' })); say('mic off', 1500); return }
      if (!navigator.mediaDevices?.getUserMedia) { mic = 'blocked'; setUi(state => ({ ...state, mic })); return }
      try {
        const probe = await navigator.mediaDevices.getUserMedia({ audio: true })
        probe.getTracks().forEach(track => track.stop())
        mic = 'ready'
        setUi(state => ({ ...state, mic }))
        say('hold space — i am listening', 3200)
      } catch {
        mic = 'blocked'
        setUi(state => ({ ...state, mic }))
        say('no mic? fine, i read the keyboard', 2600)
      }
    }
    api.current = { armMic: () => void armMic(), armMotion }

    /* --- the loop, mostly asleep ------------------------------------------ */
    const frame = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 24)
      last = now
      if (Math.abs(window.scrollY - measuredY) > 2) measure()
      // On a narrow phone the full-bleed crop leaves him out of frame. Then there
      // is nothing to look at, and nothing to spend a frame on.
      const shownWidth = Math.min(box.right, window.innerWidth) - Math.max(box.left, 0)
      const shownHeight = Math.min(box.bottom, window.innerHeight) - Math.max(box.top, 0)
      if (shownWidth * shownHeight < box.width * box.height * 0.35) {
        root.dataset.off = '1'
        closeMic()
        stop()
        return
      }
      if (root.dataset.off === '1') delete root.dataset.off
      const idle = now - lastInput
      if (!reduce && idle > 12_000) {
        // Nobody to look at: he turns to his own monitor, slowly, and wanders.
        const wander = Math.sin(now / 5200) * 0.35
        tx = ease(tx, 0.62 + wander * 0.3, 1.4, dt)
        ty = ease(ty, -0.18, 1.4, dt)
      }
      // Typing has to expire, or the last busy minute would live on his face.
      while (keys.length && now - (keys[0] ?? 0) > 1600) keys.shift()
      const scrollV = (window.scrollY - scrollY) / Math.max(dt, 0.001)
      scrollY = window.scrollY
      if (Math.abs(scrollV) > 2400) fire('fling')

      if (!reduce) {
        // A wince holds its eyes shut: a blink scheduled during it would un-squash the
        // squeeze halfway through, which reads as a wink, not as pain.
        if (blink < 0 && now > nextBlink && now > lidHold + 1900) blink = 0
        if (blink >= 0) {
          blink += dt / (face === 'sleep' ? 0.46 : 0.16)
          if (blink >= 1) { blink = -1; nextBlink = now + rand(2200, 6400) * (idle > 40_000 ? 0.35 : 1) }
        }
        wobble *= Math.exp(-5.4 * dt)
        shake *= Math.exp(-4.2 * dt)
        drift = ease(drift, Math.sin(now / 1700) * (idle > 25_000 ? 1 : 0.25), 2, dt)
      }
      if (analyser) {
        analyser.getByteTimeDomainData(samples)
        let sum = 0
        for (let i = 0; i < samples.length; i++) { const v = (samples[i] ?? 128) - 128; sum += v * v }
        voice = ease(voice, clamp(Math.sqrt(sum / samples.length) / 30), 13, dt)
      } else voice = ease(voice, 0, 7, dt)

      const asleep = face === 'sleep'
      const near = clamp(1 - pointerDist / 1.2, 0, 1)
      const fast = keys.length >= 11 ? 1 : keys.length >= 7 ? 0.5 : 0
      gx = ease(gx, clamp(tx + orientX * 0.5 + drift * 0.3), 11, dt)
      gy = ease(gy, clamp(ty + orientY * 0.4 + clamp(scrollV / 5200) * 0.25), 11, dt)
      pop = ease(pop, asleep ? 0.04 : 0.5 * near * near + voice * 0.4, 9, dt)
      converge = ease(converge, 0.35 * near * near, 9, dt)
      lean = ease(lean, near, 6, dt)
      tilt = ease(tilt, pointerTilt * 1.4 * near, 5, dt)
      // Eyes that hold perfectly still are a screensaver. Real ones never stop
      // drifting by a pixel or two, so that jitter is added on the way out — it is
      // not part of the target, or he would never be able to settle and stop.
      const saccade = Math.sin(now / 780) * 0.62 + Math.sin(now / 337 + 1.7) * 0.38
      squint = ease(squint, asleep ? 0.7 : fast, 9, dt)
      const lid = blink >= 0 ? Math.sin(Math.PI * blink) : asleep ? 0.94 : 0

      if (active && now > active.until) active = null
      show(active ? active.face : mood())

      set('--emo-gx', clamp(gx + saccade * 0.3)); set('--emo-gy', clamp(gy + saccade * 0.12))
      set('--emo-lid', lid); set('--emo-pop', pop)
      set('--emo-squint', squint); set('--emo-converge', converge)
      set('--emo-lean', reduce ? 0 : lean); set('--emo-tilt', reduce ? 0 : tilt)
      set('--emo-voice', voice)
      set('--emo-wobble', reduce ? 0 : Math.sin(now / 44) * wobble)
      set('--emo-shake', reduce ? 0 : Math.sin(now / 19) * shake)

      const settled =
        Math.abs(gx - tx) + Math.abs(gy - ty) + Math.abs(pop - 0.5 * near * near) + lid + voice + wobble + shake < 0.014
      restFrames = settled && !active && !analyser ? restFrames + 1 : 0
      if (restFrames > 110) { restFrames = 0; stop(); breathe(); return }
      raf = onScreen && !document.hidden ? requestAnimationFrame(frame) : 0
    }
    function start() { if (!raf && onScreen && !document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame) } }
    /**
     * Settled means stopped, not dead. While nobody is at the keyboard he wakes for a
     * couple of seconds every so often — that is where the blinking, the wandering off
     * to his own monitor and the late-night sleep actually live, since the moment he
     * stops, the loop that would have shown them is gone.
     */
    const breathe = () => {
      window.clearTimeout(breath)
      if (performance.now() - lastInput < 10_000 || mic === 'hot') return
      breath = window.setTimeout(() => { restFrames = 0; start() }, 4200)
    }
    const stop = () => { if (raf) cancelAnimationFrame(raf); raf = 0 }

    /* --- only while he is on screen --------------------------------------- */
    const seen = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? true
      if (onScreen) start()
      else { stop(); closeMic() }
    }, { threshold: 0 })
    seen.observe(root.closest('.hero') ?? root)

    hit.addEventListener('pointerdown', onPointerDown)
    hit.addEventListener('click', onClick)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerover', onPointerOver, { passive: true })
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    window.addEventListener('copy', onCopy)
    window.addEventListener('cut', onCopy)
    window.addEventListener('online', onNetwork)
    window.addEventListener('offline', onNetwork)
    document.addEventListener('visibilitychange', onVisibility)
    start()

    return () => {
      stop()
      window.clearTimeout(breath)
      window.clearTimeout(hintTimer)
      window.clearInterval(devCheck)
      window.clearTimeout(resizeAt)
      seen.disconnect()
      hit.removeEventListener('pointerdown', onPointerDown)
      hit.removeEventListener('click', onClick)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerover', onPointerOver)
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('copy', onCopy)
      window.removeEventListener('cut', onCopy)
      window.removeEventListener('online', onNetwork)
      window.removeEventListener('offline', onNetwork)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('deviceorientation', onTilt)
      battery?.removeEventListener('levelchange', onPower)
      battery?.removeEventListener('chargingchange', onPower)
      stopTilt()
      stream?.getTracks().forEach(track => track.stop())
      void audio?.close()
      api.current = null
    }
  }, [])

  return {
    rootRef,
    hitRef,
    hintRef,
    mic: ui.mic,
    motion: ui.motion,
    armMic: () => api.current?.armMic(),
    armMotion: () => api.current?.armMotion(),
  }
}
