import { useRef } from 'react'
import { consoleKeys } from '../lib/site'
import { useScopeWave } from '../hooks/useScopeWave'
import '../hardware-console.css'

export default function HardwareConsole() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useScopeWave(canvasRef)
  return <div className="machine-stage"><div className="machine-glow"/><section className="machine" aria-label="Contact console">
    <div className="machine-left"><div className="statusrow"><div className="lcd" role="status"><span>Available For Freelance</span><i className="led"/></div><div className="knob"/></div>
      <div className="keys"><div className="kgrid">{consoleKeys.map(([label,href,kind])=><a key={label} className={`key ${kind==='wide'?'w2':''} ${kind?`k-${kind}`:''}`} href={href} target={href.startsWith('http')?'_blank':undefined} rel="noreferrer"><span className="cap"><b>{label}</b></span></a>)}</div></div>
    </div>
    <div className="vents" aria-hidden="true">{Array.from({length:13},(_,i)=><i key={i}/>)}</div>
    <div className="scope" aria-hidden="true"><span className="screw tl"/><span className="screw tr"/><span className="screw bl"/><span className="screw br"/><div className="bezel"><div className="lip"><div className="screen"><canvas ref={canvasRef}/></div></div></div></div>
  </section></div>
}
