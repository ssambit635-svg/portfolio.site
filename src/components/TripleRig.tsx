import { useEffect, useRef } from 'react'
import { gsap } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/utils'
import plate from '../assets/hero-desk-plate.jpg'
import '../triple-rig.css'

/**
 * The triple-monitor deployment rig.
 *
 * The desk photograph (`hero-desk-plate.jpg`) is the same hero photo as before
 * with only the baked-in ultrawide monitor and its arm lifted out, so the room,
 * desk and props stay untouched. On top of it sits a real articulated 3D
 * mechanism built from nested CSS 3D joints:
 *
 *   pedestal (fixed to desk)
 *     └─ j1  rotateX  lower arm pivot        ─ seg1 (column)
 *          └─ j2  rotateX  elbow joint       ─ seg2 (upper arm) + cable
 *               └─ j3  rotateX  tilt hinge   ─ bracket
 *                    └─ yaw  rotateY swivel  ─ monitor box (6 faces)
 *
 * Every joint is a zero-size pivot element whose rotation comes from a single
 * custom property (`--a`), so GSAP can drive the whole chain by tweening three
 * numbers per monitor. The markup's inline `--a` values ARE the final, settled
 * pose: with JS off, or under `prefers-reduced-motion`, the workstation simply
 * stands fully deployed. On boot the effect snaps the chains to their stowed
 * pose (monitors high, tilted up and away, arms folded) behind the preloader,
 * then plays the deployment once when the preloader releases the page.
 */

type Side = 'left' | 'center' | 'right'

interface Pose {
  /** final joint angles, deg */
  a1: number
  a2: number
  a3: number
  /** final swivel, deg */
  yaw: number
  /** stowed joint angles, deg */
  s1: number
  s2: number
  s3: number
  /** stowed swivel, deg */
  syaw: number
  /** start delay in the deployment timeline, s */
  delay: number
}

const POSES: Record<Side, Pose> = {
  // The centre monitor leads the sequence.
  center: { a1: 6, a2: -96, a3: 86, yaw: 0, s1: 16, s2: -30, s3: -56, syaw: 0, delay: 0 },
  left: { a1: 7, a2: -93, a3: 84, yaw: 24, s1: 18, s2: -34, s3: -53, syaw: 34, delay: 0.22 },
  right: { a1: 7, a2: -93, a3: 84, yaw: -24, s1: 17, s2: -32, s3: -54, syaw: -34, delay: 0.38 },
}

/** Geometry shared by every arm, in container-width units (see triple-rig.css). */
const PED_H = 3.2
const L1 = 15.8
const L2 = 15

function JointDiscs({ d, dx }: { d: number; dx: number }) {
  return (
    <>
      <i className="rig-disc" style={{ ['--d' as string]: `${d}cqw`, ['--dx' as string]: `${dx}cqw` }} />
      <i className="rig-disc" style={{ ['--d' as string]: `${d}cqw`, ['--dx' as string]: `${-dx}cqw` }} />
    </>
  )
}

function Monitor({ side }: { side: Side }) {
  return (
    <div className={`rig-mon rig-mon--${side}`}>
      <i className="rig-face rig-f-back" aria-hidden="true">
        <span className="rig-vents" />
        <span className="rig-vesa" />
      </i>
      <i className="rig-face rig-f-top" aria-hidden="true" />
      <i className="rig-face rig-f-bottom" aria-hidden="true" />
      <i className="rig-face rig-f-left" aria-hidden="true" />
      <i className="rig-face rig-f-right" aria-hidden="true" />
      <i className="rig-face rig-f-front" aria-hidden={side !== 'center'}>
        <span className="rig-scr-on" />
        {side === 'center' && (
          <span className="rig-copy">
            <span className="hero-screen">
              <p className="hero-screen-label">DEVOPS ENGINEER · CLOUD · DESIGN</p>
              <h1 className="hero-screen-title"><span>From code to cloud.</span><span>From pixels to production.</span></h1>
            </span>
          </span>
        )}
        <span className="rig-glass" />
        <span className="rig-pwr"><i /></span>
      </i>
    </div>
  )
}

function Assembly({ side }: { side: Side }) {
  const p = POSES[side]
  const joint = (cls: string, a: number, top: number, children: React.ReactNode) => (
    <div className={cls} style={{ ['--a' as string]: a, top: `${top}cqw` }}>{children}</div>
  )
  return (
    <div className={`rig-asm rig-asm--${side}`} data-side={side} aria-hidden={side === 'center' ? undefined : true}>
      {/* desk contact: foot plate, pedestal column, top cap */}
      <i className="rig-foot" aria-hidden="true" />
      <i className="rig-ped" aria-hidden="true" />
      <i className="rig-pedcap" aria-hidden="true" />
      {joint('rig-j rig-j1', p.a1, -PED_H, (
        <>
          <i className="rig-seg rig-seg1" aria-hidden="true" />
          <JointDiscs d={2.9} dx={1.25} />
          {joint('rig-j rig-j2', p.a2, -L1, (
            <>
              <i className="rig-seg rig-seg2" aria-hidden="true" />
              <i className="rig-cable" aria-hidden="true" />
              <JointDiscs d={2.3} dx={1.1} />
              {joint('rig-j rig-j3', p.a3, -L2, (
                <>
                  <i className="rig-brk" aria-hidden="true" />
                  <JointDiscs d={1.8} dx={0.95} />
                  <div className="rig-yaw">
                    <Monitor side={side} />
                  </div>
                </>
              ))}
            </>
          ))}
        </>
      ))}
    </div>
  )
}

export default function TripleRig() {
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const root = wrap.current
    if (!root || prefersReducedMotion()) return

    const asms = [...root.querySelectorAll<HTMLElement>('.rig-asm')].map((el) => ({
      el,
      side: el.dataset.side as Side,
      j1: el.querySelector<HTMLElement>('.rig-j1')!,
      j2: el.querySelector<HTMLElement>('.rig-j2')!,
      j3: el.querySelector<HTMLElement>('.rig-j3')!,
      yaw: el.querySelector<HTMLElement>('.rig-yaw')!,
      on: el.querySelectorAll<HTMLElement>('.rig-scr-on'),
      pwr: el.querySelectorAll<HTMLElement>('.rig-pwr i'),
    }))
    const copy = root.querySelector<HTMLElement>('.rig-copy')
    const amb = root.querySelector<HTMLElement>('.rig-amb')
    const csh = root.querySelector<HTMLElement>('.rig-cshadow')
    if (!copy || !amb || !csh) return

    /* Snap to the stowed pose while the preloader still covers the hero. */
    for (const a of asms) {
      const p = POSES[a.side]
      gsap.set(a.j1, { '--a': p.s1 })
      gsap.set(a.j2, { '--a': p.s2 })
      gsap.set(a.j3, { '--a': p.s3 })
      gsap.set(a.yaw, { '--yaw': p.syaw })
      gsap.set(a.on, { autoAlpha: 0 })
      gsap.set(a.pwr, { autoAlpha: 0 })
    }
    gsap.set(copy, { autoAlpha: 0, y: '0.8cqw', filter: 'blur(0.6cqw)' })
    gsap.set(amb, { y: '-8.5cqw', opacity: 0.4 })
    gsap.set(csh, { autoAlpha: 0, scale: 0.72 })
    root.classList.add('is-arming')

    let tl: gsap.core.Timeline | null = null

    const play = () => {
      tl = gsap.timeline({ onComplete: () => root.classList.remove('is-arming') })
      /* The room reacts as one: backlight and desk shadow travel with the fold. */
      tl.to(amb, { y: '0cqw', opacity: 1, duration: 1.9, ease: 'power2.inOut' }, 0)
      tl.to(csh, { autoAlpha: 1, scale: 1, duration: 1.8, ease: 'power2.inOut' }, 0.15)
      for (const a of asms) {
        const p = POSES[a.side]
        const d = p.delay
        /* Heavy, deliberate descent — column tips, then elbow unfolds, then the
           hinge levels: a whip of three actuators, not one glued transform. */
        tl.to(a.j1, { '--a': p.a1, duration: 1.6, ease: 'power3.inOut' }, d)
        tl.to(a.j2, { '--a': p.a2, duration: 1.6, ease: 'power3.inOut' }, d + 0.12)
        tl.to(a.j3, { '--a': p.a3, duration: 1.5, ease: 'power3.inOut' }, d + 0.26)
        /* The swivel screws in from a splayed stow while the arm falls. */
        tl.to(a.yaw, { '--yaw': p.yaw, duration: 1.7, ease: 'power2.inOut' }, d + 0.1)
        /* Mechanical settle: one small overshoot past the stop, then rest. */
        tl.to(a.j3, { '--a': p.a3 - 1.15, duration: 0.16, ease: 'power1.out' }, d + 1.88)
        tl.to(a.j3, { '--a': p.a3, duration: 0.42, ease: 'power2.out' }, d + 2.04)
        tl.to(a.j2, { '--a': p.a2 + 0.5, duration: 0.16, ease: 'power1.out' }, d + 1.88)
        tl.to(a.j2, { '--a': p.a2, duration: 0.42, ease: 'power2.out' }, d + 2.04)
        /* Panels strike mid-descent, centre first, exactly as in the reel. */
        tl.to(a.on, { autoAlpha: 1, duration: 0.5, ease: 'power1.inOut' }, d + 1.0)
        tl.to(a.pwr, { autoAlpha: 1, duration: 0.3 }, d + 1.0)
      }
      /* The headline lands once the centre monitor has stopped moving. */
      tl.to(copy, { autoAlpha: 1, y: '0cqw', filter: 'blur(0cqw)', duration: 0.85, ease: 'power2.out' }, 2.1)
    }

    if (document.documentElement.dataset.boot === '1') {
      window.addEventListener('boot:done', play, { once: true })
      const safety = window.setTimeout(play, 8000)
      return () => {
        window.removeEventListener('boot:done', play)
        window.clearTimeout(safety)
        tl?.kill()
        root.classList.remove('is-arming')
      }
    }
    play()
    return () => {
      tl?.kill()
      root.classList.remove('is-arming')
    }
  }, [])

  return (
    <div className="hero-monitor-wrapper rig-wrap" ref={wrap}>
      <img src={plate} alt="" width={1376} height={768} className="hero-monitor" fetchPriority="high" />
      <div className="rig-amb" aria-hidden="true" />
      <div className="rig-cshadow" aria-hidden="true" />
      <div className="rig-stage">
        <Assembly side="left" />
        <Assembly side="center" />
        <Assembly side="right" />
      </div>
    </div>
  )
}
