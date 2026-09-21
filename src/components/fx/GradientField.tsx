import { useEffect, useRef } from 'react'
import { onPointer } from '../../lib/pointer'
import { Grain } from './Grain'

/**
 * The premium backdrop used on the cinematic screens (signature loader and
 * entry gate): a deep ink base, four slow-drifting aurora blooms, a conic
 * "stage light" sweep, a pointer-reactive lamp, film grain and a vignette.
 *
 * It is pure CSS + one grain canvas, so it costs nothing on the GPU compared
 * with a second WebGL context and it survives every environment.
 */

export type FieldPreset = 'maison' | 'atelier' | 'paper'

type Blob = {
  color: string
  /** % of the field */
  x: number
  y: number
  size: number
  opacity: number
  blur: number
  duration: number
  delay: number
  alt?: boolean
}

const PRESETS: Record<FieldPreset, { base: string; blobs: Blob[]; lamp: string; vignette: string; grain: number }> = {
  maison: {
    base: 'radial-gradient(130% 100% at 50% -10%, #1c1830 0%, #120f1f 34%, #08090f 68%, #04040a 100%)',
    blobs: [
      { color: 'rgb(86 58 168)', x: 16, y: 18, size: 46, opacity: 0.5, blur: 90, duration: 26, delay: 0 },
      { color: 'rgb(24 92 122)', x: 82, y: 24, size: 42, opacity: 0.42, blur: 100, duration: 32, delay: -6, alt: true },
      { color: 'rgb(158 92 52)', x: 72, y: 82, size: 40, opacity: 0.3, blur: 110, duration: 38, delay: -14 },
      {
        color: 'rgb(196 152 84)',
        x: 26,
        y: 78,
        size: 34,
        opacity: 0.22,
        blur: 120,
        duration: 44,
        delay: -20,
        alt: true
      }
    ],
    lamp: 'radial-gradient(circle at 50% 50%, rgb(255 236 200 / 0.16), rgb(226 183 106 / 0.06) 38%, transparent 66%)',
    vignette: 'radial-gradient(120% 90% at 50% 45%, transparent 38%, rgb(2 2 6 / 0.72) 100%)',
    grain: 0.085
  },
  atelier: {
    base: 'radial-gradient(125% 95% at 50% 0%, #151a2c 0%, #0d1020 40%, #06070d 74%, #030308 100%)',
    blobs: [
      { color: 'rgb(58 74 158)', x: 22, y: 26, size: 48, opacity: 0.44, blur: 95, duration: 28, delay: -2 },
      {
        color: 'rgb(122 176 165)',
        x: 78,
        y: 20,
        size: 38,
        opacity: 0.28,
        blur: 105,
        duration: 34,
        delay: -9,
        alt: true
      },
      { color: 'rgb(226 183 106)', x: 62, y: 84, size: 44, opacity: 0.2, blur: 115, duration: 40, delay: -16 },
      {
        color: 'rgb(214 152 132)',
        x: 18,
        y: 72,
        size: 32,
        opacity: 0.24,
        blur: 120,
        duration: 46,
        delay: -24,
        alt: true
      }
    ],
    lamp: 'radial-gradient(circle at 50% 50%, rgb(226 240 255 / 0.14), rgb(122 176 165 / 0.06) 40%, transparent 68%)',
    vignette: 'radial-gradient(120% 90% at 50% 45%, transparent 40%, rgb(2 2 6 / 0.7) 100%)',
    grain: 0.075
  },
  paper: {
    base: 'radial-gradient(120% 95% at 50% 0%, #fbf6ea 0%, #f4ecdc 45%, #ece1cd 100%)',
    blobs: [
      { color: 'rgb(226 183 106)', x: 20, y: 22, size: 44, opacity: 0.3, blur: 100, duration: 30, delay: 0 },
      {
        color: 'rgb(122 176 165)',
        x: 80,
        y: 30,
        size: 40,
        opacity: 0.26,
        blur: 110,
        duration: 36,
        delay: -8,
        alt: true
      },
      { color: 'rgb(214 152 132)', x: 60, y: 82, size: 42, opacity: 0.24, blur: 115, duration: 42, delay: -18 }
    ],
    lamp: 'radial-gradient(circle at 50% 50%, rgb(255 255 255 / 0.5), rgb(226 183 106 / 0.12) 42%, transparent 70%)',
    vignette: 'radial-gradient(120% 90% at 50% 45%, transparent 45%, rgb(90 74 48 / 0.22) 100%)',
    grain: 0.06
  }
}

export function GradientField({
  preset = 'maison',
  lamp = true,
  grain = true,
  className = ''
}: {
  preset?: FieldPreset
  /** pointer-following light */
  lamp?: boolean
  grain?: boolean
  className?: string
}) {
  const config = PRESETS[preset] ?? PRESETS.maison
  const lampRef = useRef<HTMLDivElement>(null)
  const sweepRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!lamp) return
    return onPointer((p) => {
      const el = lampRef.current
      if (el) {
        const x = 50 + p.x * 26
        const y = 50 + p.y * 22
        el.style.transform = `translate3d(${(x - 50).toFixed(2)}%, ${(y - 50).toFixed(2)}%, 0)`
      }
      const sweep = sweepRef.current
      if (sweep) {
        sweep.style.transform = `translate3d(${(p.x * 3).toFixed(2)}%, ${(p.y * 2).toFixed(2)}%, 0) rotate(${(
          p.x * 4
        ).toFixed(2)}deg)`
      }
    })
  }, [lamp])

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`} aria-hidden="true">
      {/* base ink */}
      <div className="absolute inset-0" style={{ background: config.base }} />

      {/* aurora blooms */}
      {config.blobs.map((blob, i) => (
        <div
          key={i}
          className="absolute rounded-full will-change-transform"
          style={{
            left: `${blob.x}%`,
            top: `${blob.y}%`,
            width: `${blob.size}vmax`,
            height: `${blob.size}vmax`,
            marginLeft: `${-blob.size / 2}vmax`,
            marginTop: `${-blob.size / 2}vmax`,
            background: `radial-gradient(circle at 50% 50%, ${blob.color} 0%, transparent 68%)`,
            opacity: blob.opacity,
            filter: `blur(${blob.blur}px)`,
            animation: `${blob.alt ? 'aurora-drift-alt' : 'aurora-drift'} ${blob.duration}s ease-in-out ${blob.delay}s infinite`,
            mixBlendMode: preset === 'paper' ? 'multiply' : 'screen'
          }}
        />
      ))}

      {/* slow conic stage light */}
      <div
        ref={sweepRef}
        className="absolute -inset-[25%] will-change-transform"
        style={{
          background:
            'conic-gradient(from 210deg at 50% 42%, transparent 0deg, rgb(226 183 106 / 0.07) 42deg, transparent 96deg, rgb(122 176 165 / 0.06) 168deg, transparent 232deg, rgb(214 152 132 / 0.07) 300deg, transparent 360deg)',
          animation: 'aurora-drift-alt 64s linear infinite',
          mixBlendMode: 'screen'
        }}
      />

      {/* pointer lamp */}
      {lamp && (
        <div
          ref={lampRef}
          className="absolute inset-0 will-change-transform transition-opacity duration-700"
          style={{ background: config.lamp, mixBlendMode: preset === 'paper' ? 'soft-light' : 'screen' }}
        />
      )}

      {/* hairline horizon rule — a bit of editorial structure */}
      <div
        className="absolute inset-x-0 top-1/2 h-px opacity-25"
        style={{
          background:
            'linear-gradient(90deg, transparent, rgb(226 183 106 / 0.5) 22%, rgb(255 246 226 / 0.7) 50%, rgb(214 152 132 / 0.45) 78%, transparent)'
        }}
      />

      {grain && <Grain opacity={config.grain} fixed={false} zIndex={4} />}

      {/* vignette seats the content in the frame */}
      <div className="absolute inset-0" style={{ background: config.vignette }} />
    </div>
  )
}
