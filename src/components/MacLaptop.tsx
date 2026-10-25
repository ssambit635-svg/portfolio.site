import MacDesktop from './MacDesktop'
import macbook from '../assets/macbook-studio.jpg'
import '../mac-desktop.css'

/**
 * The footer's MacBook. The photo is a real-machine studio shot, framed to a
 * tight 16:9 crop of the 1408×768 source (x 136–1272, y 62–700) so the ENTIRE
 * laptop — lid to base — fills the footer screen, big and sharp. The screen
 * box is measured off that photo (x 399–1009, y 105.5–510), so the live
 * desktop sits exactly inside the bezel with no gap at any size.
 */
export default function MacLaptop() {
  return (
    <div className="lap-stage">
      <div className="lap-glow" aria-hidden="true" />
      <div className="lap-frame">
        <img className="lap-photo" src={macbook} alt="" aria-hidden="true" decoding="async" />
        <div className="lap-floor" aria-hidden="true" />
        <div
          className="lap-screen"
          role="group"
          aria-label="Sambit’s MacBook Pro — an interactive desktop where every app is a way to reach him"
        >
          <MacDesktop />
        </div>
        <div className="lap-glare" aria-hidden="true" />
        <div className="lap-base" aria-hidden="true" />
      </div>
    </div>
  )
}
