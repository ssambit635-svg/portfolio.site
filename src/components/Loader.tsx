import { useEffect, useRef, useState } from 'react'
import { SplitDoors } from './fx/SplitDoors'

/**
 * Apple-style intro: "Sambit Swain" writes itself in monoline cursive —
 * hand-built SVG strokes drawn with stroke-dashoffset at real pen pace,
 * trailed by a glowing ink dot — then the gate doors split open
 * horizontally to reveal the site.
 */

/* Hand-lettered strokes in exact writing order. */
const STROKES: string[][] = [
  // S
  [
    'M 150,70 C 132,52 100,55 88,80 C 76,105 96,128 122,140 C 148,152 152,182 132,200 C 112,218 78,218 66,196 C 62,190 60,184 62,176',
    'M 66,196 C 84,214 110,214 130,204'
  ],
  // a
  [
    'M 168,208 C 174,196 179,183 181,170 C 183,154 169,147 157,155 C 141,164 137,190 151,202 C 161,210 175,204 180,190 C 183,198 185,205 191,208 C 196,211 203,208 209,200'
  ],
  // m
  [
    'M 209,200 C 214,190 218,172 221,155 C 222,138 243,128 250,150 C 254,166 254,188 255,205 C 257,163 262,140 272,134 C 282,128 292,138 293,152 C 294,168 293,188 294,205 C 296,210 303,207 310,198'
  ],
  // b
  [
    'M 310,198 C 319,172 330,132 342,104 C 349,124 344,164 331,198 C 342,152 368,144 377,162 C 386,180 370,200 348,203 C 340,204 333,202 328,198 C 341,211 353,207 363,200'
  ],
  // i (+ dot)
  [
    'M 362,200 C 368,188 372,168 374,152 C 376,168 376,192 380,206 C 383,210 390,208 398,200',
    'M 381,115 l 1,1'
  ],
  // t (+ crossbar)
  [
    'M 398,200 C 405,180 412,138 420,112 C 421,140 421,180 425,202 C 428,212 438,210 446,200',
    'M 404,142 C 414,138 432,134 448,133'
  ],
  // S
  [
    'M 690,70 C 672,52 640,55 628,80 C 616,105 636,128 662,140 C 688,152 692,182 672,200 C 652,218 618,218 606,196 C 602,190 600,184 602,176',
    'M 606,196 C 622,213 644,214 658,208'
  ],
  // w
  [
    'M 658,208 C 668,190 674,168 678,152 C 679,172 681,194 687,206 C 691,214 701,210 706,198 C 711,186 715,166 717,152 C 719,172 721,194 727,206 C 732,214 742,210 749,198',
    'M 749,198 C 762,204 778,207 790,205'
  ],
  // a
  [
    'M 792,208 C 798,196 803,183 805,170 C 807,154 793,147 781,155 C 765,164 761,190 775,202 C 785,210 799,204 804,190 C 807,198 809,205 815,208 C 820,211 827,208 833,200'
  ],
  // i (+ dot)
  [
    'M 833,200 C 839,188 843,168 845,152 C 847,168 847,192 851,206 C 854,210 861,208 869,200',
    'M 852,115 l 1,1'
  ],
  // n (+ finishing flourish)
  [
    'M 869,200 C 873,190 877,170 879,155 C 880,137 898,130 905,146 C 909,158 907,185 906,202 C 908,210 916,207 924,197 C 942,191 966,186 986,182'
  ]
]

const WRITE_SECONDS = 2.5 // total time for the full signature
const INTRO_DELAY = 0.4

export function Loader({ onExit }: { onExit: () => void }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const [written, setWritten] = useState(false)
  const [doorsOpen, setDoorsOpen] = useState(false)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const paths = Array.from(svg.querySelectorAll('path'))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const geometry =
      typeof SVGPathElement !== 'undefined' && typeof paths[0]?.getTotalLength === 'function'

    /* Schedule: how long each stroke takes given one shared pen pace. */
    let schedule: { path: SVGPathElement; len: number; delay: number; dur: number }[] = []
    let total = INTRO_DELAY

    if (geometry && !reduced) {
      const lengths = paths.map((p) => Math.max(p.getTotalLength(), 1))
      const totalLen = lengths.reduce((a, b) => a + b, 0)
      const pace = totalLen / WRITE_SECONDS

      paths.forEach((p, i) => {
        const len = lengths[i]
        const dur = Math.max(len / pace, 0.03)
        schedule.push({ path: p, len, delay: total, dur })
        p.style.strokeDasharray = `${len}`
        p.style.strokeDashoffset = `${len}`
        p.style.transition = `stroke-dashoffset ${dur}s cubic-bezier(0.45, 0.05, 0.35, 0.95) ${total}s`
        total += dur * 0.96
      })

      requestAnimationFrame(() => {
        paths.forEach((p) => {
          p.style.strokeDashoffset = '0'
        })
      })
    } else {
      paths.forEach((p) => (p.style.opacity = '1'))
      total = 0.6
      schedule = []
    }

    /* The ink dot hunting along freshly-written strokes. */
    let raf = 0
    const canTrack =
      geometry && !reduced && schedule.length > 0 && typeof schedule[0].path.getPointAtLength === 'function'

    if (canTrack) {
      const [vbX, vbY, vbW] = (svg.getAttribute('viewBox') ?? '0 0 1 1').split(/\s+/).map(Number)
      const started = performance.now()

      const track = (now: number) => {
        const elapsed = (now - started) / 1000
        const dot = dotRef.current
        const wrap = wrapRef.current
        if (!dot || !wrap) return

        const active = schedule.find((s) => elapsed >= s.delay && elapsed <= s.delay + s.dur)
        if (!active) {
          dot.style.opacity = '0'
          if (elapsed < total) raf = requestAnimationFrame(track)
          return
        }

        const rect = svg.getBoundingClientRect()
        const wrapRect = wrap.getBoundingClientRect()
        if (rect.width < 4) {
          raf = requestAnimationFrame(track)
          return
        }

        const progress = Math.min((elapsed - active.delay) / active.dur, 1)
        const pt = active.path.getPointAtLength(progress * active.len)
        const scale = rect.width / vbW
        const x = rect.left - wrapRect.left + (pt.x - vbX) * scale
        const y = rect.top - wrapRect.top + (pt.y - vbY) * scale

        dot.style.opacity = '1'
        dot.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%)`
        raf = requestAnimationFrame(track)
      }
      raf = requestAnimationFrame(track)
    }

    const timers = [
      window.setTimeout(() => setWritten(true), (total + 0.1) * 1000),
      window.setTimeout(() => setDoorsOpen(true), (total + 0.7) * 1000)
    ]
    return () => {
      timers.forEach((t) => window.clearTimeout(t))
      cancelAnimationFrame(raf)
    }
  }, [])

  const signature = (
    <div ref={wrapRef} className="relative flex flex-col items-center">
      <svg
        ref={svgRef}
        viewBox="40 40 1000 220"
        className="w-[min(82vw,600px)] overflow-visible"
        aria-hidden="true"
      >
        <g
          stroke="#fafafa"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.22))' }}
        >
          {STROKES.flat().map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </svg>

      {/* The ink dot trailing the pen */}
      <div
        ref={dotRef}
        className="pointer-events-none absolute left-0 top-0 h-2.5 w-2.5 rounded-full bg-white opacity-0 shadow-[0_0_14px_4px_rgba(255,255,255,0.55)] transition-opacity duration-200"
        aria-hidden="true"
      />

      <div
        className={`mt-12 font-mono text-[11px] uppercase tracking-[0.35em] text-neutral-500 transition-opacity duration-700 ${
          written && !doorsOpen ? 'opacity-100' : 'opacity-0'
        }`}
      >
        software developer — portfolio
      </div>
    </div>
  )

  return <SplitDoors open={doorsOpen} onDone={onExit} bg="#0a0a0a" zIndex={100} durationMs={1200}>{signature}</SplitDoors>
}
