import { useEffect, useRef, useState } from 'react'

/**
 * Apple-style intro: "Sambit Swain" writes itself in monoline cursive
 * (hand-built SVG paths, drawn with stroke-dashoffset), a quiet caption
 * fades in, then the whole curtain lifts away to reveal the site.
 */

/* Hand-lettered paths, grouped per letter in writing order. */
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
    'M 310,198 C 318,172 330,128 342,100 C 346,118 342,165 330,200 C 344,146 372,142 378,164 C 384,184 368,202 344,203 C 338,203 332,201 328,198 C 340,212 352,208 362,200'
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

const PACE = 260 // px per second — measured, penmanship speed
const INTRO_DELAY = 0.45

export function Loader({ onExit }: { onExit: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [written, setWritten] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const exitedRef = useRef(false)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    const paths = Array.from(svg.querySelectorAll('path'))
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let total = INTRO_DELAY
    if (reduced) {
      // Skip the draw entirely — show it, hold, lift.
      paths.forEach((p) => (p.style.opacity = '1'))
      total = 0.6
    } else {
      paths.forEach((p) => {
        const len =
          typeof p.getTotalLength === 'function' && !Number.isNaN(p.getTotalLength())
            ? Math.max(p.getTotalLength(), 1)
            : 140
        p.style.strokeDasharray = `${len}`
        p.style.strokeDashoffset = `${len}`
        const duration = Math.max(len / PACE, 0.04)
        p.style.transition = `stroke-dashoffset ${duration}s cubic-bezier(0.45, 0.05, 0.35, 0.95) ${total}s`
        total += duration * 0.96
      })
      // Kick off on the next frame so the initial dash state is painted.
      requestAnimationFrame(() => {
        paths.forEach((p) => {
          p.style.strokeDashoffset = '0'
        })
      })
    }

    const timers = [
      window.setTimeout(() => setWritten(true), (total + 0.15) * 1000),
      window.setTimeout(() => setLeaving(true), (total + 0.8) * 1000),
      window.setTimeout(
        () => {
          if (!exitedRef.current) {
            exitedRef.current = true
            onExit()
          }
        },
        (total + 0.8 + 1.0) * 1000
      )
    ]
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [onExit])

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0a0a0a] transition-transform duration-[950ms] ease-[cubic-bezier(0.76,0,0.24,1)] ${
        leaving ? '-translate-y-full' : 'translate-y-0'
      }`}
      role="status"
      aria-label="Loading Sambit Swain's portfolio"
    >
      <div
        className={`transition-all duration-700 ${
          leaving ? '-translate-y-10 opacity-0' : 'translate-y-0 opacity-100'
        }`}
      >
        <svg
          ref={svgRef}
          viewBox="40 40 1000 220"
          className="w-[min(76vw,540px)] overflow-visible"
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
      </div>

      <div
        className={`mt-10 font-mono text-[11px] uppercase tracking-[0.35em] text-neutral-500 transition-opacity duration-700 ${
          written && !leaving ? 'opacity-100' : 'opacity-0'
        }`}
      >
        software developer — portfolio
      </div>
    </div>
  )
}
