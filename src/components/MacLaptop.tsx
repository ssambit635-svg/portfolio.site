import MacDesktop from './MacDesktop'
import macbook from '../assets/macbook-pro-front.jpg'
import '../mac-desktop.css'

/**
 * The footer's MacBook. The photo is the real hardware — an untouched studio
 * shot — and everything inside the panel is a live, working macOS desktop
 * (`MacDesktop`). The screen box below is measured off that photo, so the
 * desktop sits exactly inside the bezel with no gap at any size.
 */
export default function MacLaptop() {
  return (
    <div className="lap-stage">
      <div className="lap-glow" aria-hidden="true" />
      <div className="lap-glow-floor" aria-hidden="true" />
      <div className="lap-frame">
        <img className="lap-photo" src={macbook} alt="" aria-hidden="true" decoding="async" />
        <div className="lap-screen" role="group" aria-label="Sambit’s MacBook Pro — an interactive desktop where every app is a way to reach him">
          <MacDesktop />
        </div>
        <div className="lap-glare" aria-hidden="true" />
        <div className="lap-base" aria-hidden="true" />
      </div>
    </div>
  )
}
