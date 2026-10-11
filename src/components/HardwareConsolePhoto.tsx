import { useRef } from 'react'
import { consoleKeys } from '../lib/site'
import { useScopeWave } from '../hooks/useScopeWave'
import face from '../assets/console-face.jpg'
import '../hardware-console.css'

/**
 * Desktop contact console: a photoreal faceplate render with the live parts
 * (LCD status, keycap links, oscilloscope canvas) overlaid in percent so they
 * stay glued to the metal at any width. Mobile keeps the CSS-drawn machine.
 */
export default function HardwareConsolePhoto() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useScopeWave(canvasRef)
  return <div className="machine-photo-stage"><div className="machine-glow"/><section className="machine-photo" aria-label="Contact console">
    <img src={face} alt="" />
    <div className="lcd photo-lcd" role="status"><span>Available For Freelance</span><i className="led"/></div>
    <div className="keys photo-keys"><div className="kgrid">{consoleKeys.map(([label,href,kind])=><a key={label} className={`key ${kind==='wide'?'w2':''} ${kind?`k-${kind}`:''}`} href={href} target={href.startsWith('http')?'_blank':undefined} rel="noreferrer"><span className="cap"><b>{label}</b></span></a>)}</div></div>
    <div className="scope-glass" aria-hidden="true"><div className="screen"><canvas ref={canvasRef}/></div></div>
  </section></div>
}
