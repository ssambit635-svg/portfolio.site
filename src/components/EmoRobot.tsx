import type { CSSProperties } from 'react'
import { emoFace } from '../lib/emoFace'
import { useEmo } from '../hooks/useEmo'
import '../emo.css'

/**
 * Emo, the desk robot in the hero photograph.
 *
 * Nothing is painted over him, and nothing wraps him. Every value is measured off the
 * photo by scripts/emo-geometry.mjs — positions as percentages so he rides the hero crop
 * at any viewport, colours sampled from his own pixels — and his face is three blend
 * layers per eye: `darken` clips his painted eyes back to the dark of his glass, then
 * `screen` adds a halo, then `screen` adds the eye itself. That is why his screen stays
 * his screen instead of gaining a second display, and why every one of his layers is a
 * sibling of the others: any transform, z-index, filter or faded opacity on an ancestor turns that
 * ancestor into a blend container, and the blending would then happen against thin air
 * instead of against the photograph. (See the top of src/emo.css.)
 *
 * Where the crop leaves him out of frame (a narrow phone) he stops; see useEmo.
 */
const pc = (value: number) => `${value}%`
const side = (index: number) => (index === 0 ? 'a' : 'b')

export default function EmoRobot() {
  const { rootRef, hitRef, hintRef, mic, motion, armMic, armMotion } = useEmo()
  const { head, eyes } = emoFace

  const stage = {
    '--emo-head-x': pc(head.x),
    '--emo-head-y': pc(head.y),
    '--emo-head-w': pc(head.w),
    '--emo-head-h': pc(head.h),
  } as CSSProperties

  const layers = eyes.map((eye, index) => ({
    side: side(index),
    style: {
      // The box his glow fills — the erase and the halo both live here.
      '--emo-box-x': pc(eye.socket.x),
      '--emo-box-y': pc(eye.socket.y),
      '--emo-box-w': pc(eye.socket.w),
      '--emo-box-h': pc(eye.socket.h),
      // And the box his paint actually occupies, so a resting eye lands on it exactly.
      '--emo-core-x': pc(eye.core.x),
      '--emo-core-y': pc(eye.core.y),
      '--emo-core-w': pc(eye.core.w),
      '--emo-core-h': pc(eye.core.h),
      '--emo-eye-glass': eye.glass,
      '--emo-eye-peak': eye.peak,
      '--emo-eye-mid': eye.mid,
      '--emo-eye-glow': eye.glow,
      '--emo-roam-x': eye.roam.x,
      '--emo-roam-y': eye.roam.y,
    } as CSSProperties,
  }))

  return (
    <div className="emo" ref={rootRef} style={stage} data-face="curious">
      {/* Paint order is blend order: all three clips first, so no eye's darkening step
          lands on top of the light the other eye is already throwing. */}
      {layers.map(l => (
        <span key={`clip${l.side}`} className={`emo-clip emo-${l.side}`} style={l.style} aria-hidden="true" />
      ))}
      {layers.map(l => (
        <span key={`glow${l.side}`} className={`emo-glow emo-${l.side}`} style={l.style} aria-hidden="true" />
      ))}
      {layers.map(l => (
        <span key={`orb${l.side}`} className={`emo-orb emo-orb-${l.side} emo-${l.side}`} style={l.style} aria-hidden="true" />
      ))}
      <span className="emo-hint" ref={hintRef} aria-hidden="true" />

      {/* He answers to a poke, and to Enter when the tab order reaches him. No ring, no
          hover box: he is a robot on a desk, not a control. */}
      <button className="emo-hit" ref={hitRef} type="button" aria-label="Say hello to Emo, the robot on the desk" />

      <span className="emo-sr" role="status" aria-live="polite">
        {mic === 'hot' ? 'Emo is listening. Release space to stop.' : mic === 'ready' ? 'Emo can hear you now: hold space to talk.' : ''}
      </span>

      {/* Two switches, both opt-in, both reversible, and nothing leaves the device: the
          mic is open only while Space is held, and orientation stays in the page. A
          device with no tilt sensor never gets offered the second one. */}
      {mic !== 'blocked' && (
        <span className="emo-senses">
          <button className="emo-chip" type="button" onClick={armMic} data-live={mic === 'hot' ? '1' : '0'}>
            <i aria-hidden="true" />
            {mic === 'off' ? 'give emo a mic' : mic === 'ready' ? 'space to talk to emo' : 'emo is listening'}
          </button>
          {motion !== 'na' && (
            <button className="emo-chip" type="button" onClick={armMotion} data-live={motion === 'on' ? '1' : '0'}>
              <i aria-hidden="true" />
              {motion === 'on' ? 'he can feel the desk tilt' : 'let him feel the desk tilt'}
            </button>
          )}
        </span>
      )}
    </div>
  )
}
