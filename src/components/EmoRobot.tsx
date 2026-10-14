import type { CSSProperties } from 'react'
import { emoFace } from '../lib/emoFace'
import { useEmo } from '../hooks/useEmo'
import '../emo.css'

/**
 * Emo, the desk robot in the hero photograph.
 *
 * He is not an illustration on top of the photo — he is the photo's own robot,
 * re-lit: a plate of his glass is drawn over the eyes baked into the picture and
 * two real eyes are rendered inside it, so he can look at the cursor, watch you
 * type, flinch when the window is resized, and go amber when the network drops.
 * Every position is a percentage of the photo measured by
 * scripts/emo-geometry.mjs, which is why he still sits in his socket when the
 * hero is cropped from 21:9 down to a tablet. Where the crop leaves him out of
 * frame (a narrow phone) he simply stops — see useEmo.
 */
const pc = (value: number) => `${value}%`

export default function EmoRobot() {
  const { rootRef, hitRef, hintRef, mic, motion, armMic, armMotion } = useEmo()
  const { plate, head, eyes, glass } = emoFace

  const stage = {
    '--emo-plate-x': pc(plate.x),
    '--emo-plate-y': pc(plate.y),
    '--emo-plate-w': pc(plate.w),
    '--emo-plate-h': pc(plate.h),
    '--emo-head-x': pc(head.x),
    '--emo-head-y': pc(head.y),
    '--emo-head-w': pc(head.w),
    '--emo-head-h': pc(head.h),
    '--emo-glass': glass,
    '--emo-face-turn': `${emoFace.turn}deg`,
    '--emo-roam': eyes[0]?.roam ?? 1,
  } as CSSProperties

  return (
    <div className="emo" ref={rootRef} style={stage} data-face="curious">
      <div className="emo-head">
        <span className="emo-plate" aria-hidden="true" />
        {eyes.map((eye, index) => (
          <span
            key={index}
            className={`emo-eye emo-eye-${index === 0 ? 'a' : 'b'}`}
            aria-hidden="true"
            style={{
              '--emo-eye-x': pc(eye.cx),
              '--emo-eye-y': pc(eye.cy),
              '--emo-eye-w': pc(eye.w),
              '--emo-eye-h': pc(eye.h),
            } as CSSProperties}
          >
            <i className="emo-orb" />
          </span>
        ))}
        <span className="emo-hint" ref={hintRef} aria-hidden="true" />
      </div>

      {/* He answers to a poke, and to Enter when the tab order reaches him. */}
      <button className="emo-hit" ref={hitRef} type="button" aria-label="Say hello to Emo, the robot on the desk" />

      <span className="emo-sr" role="status" aria-live="polite">
        {mic === 'hot' ? 'Emo is listening. Release space to stop.' : mic === 'ready' ? 'Emo can hear you now: hold space to talk.' : ''}
      </span>

      {/* Two switches, both opt-in, both reversible, and nothing leaves the device:
          the mic is open only while space is held, and orientation stays in the page.
          A device with no tilt sensor never gets offered the second one. */}
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
