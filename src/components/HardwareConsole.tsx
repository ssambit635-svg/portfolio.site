import { useEffect, useRef } from 'react'
import { profile } from '../lib/site'
import '../hardware-console.css'

export default function HardwareConsole() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    let frame = 0, w = 0, h = 0
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const size = () => { const r=cv.getBoundingClientRect(), d=Math.min(devicePixelRatio||1,2); w=r.width; h=r.height; cv.width=w*d; cv.height=h*d; ctx.setTransform(d,0,0,d,0,0); draw(1.3) }
    const wave = (x:number,t:number) => .5-.27*(.58+.42*Math.sin(x*5.2-t*.9)*Math.sin(x*2.1+t*.37))*(Math.sin(x*34-t*7.5)*.82+Math.sin(x*79-t*11)*.18)*Math.pow(Math.sin(Math.PI*x),.6)
    const draw = (t:number) => {
      ctx.globalCompositeOperation='destination-out'; ctx.fillStyle=still?'#000':'rgba(0,0,0,.24)'; ctx.fillRect(0,0,w,h); ctx.globalCompositeOperation='source-over'; ctx.lineJoin='round'; ctx.lineCap='round'
      const pass=(color:string,width:number,blur:number)=>{ctx.beginPath();for(let x=0;x<=w;x+=2){const y=wave(x/w,t)*h+(still?0:(Math.random()-.5)*.7);x?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.shadowColor='rgba(60,255,60,.9)';ctx.shadowBlur=blur;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.stroke()}
      pass('rgba(70,255,70,.4)',6.5,18);pass('#8dff6a',2.4,8);pass('#e4ffd8',.9,0);ctx.shadowBlur=0
    }
    const loop=(n:number)=>{draw(n/1000);frame=requestAnimationFrame(loop)}
    const observer=new ResizeObserver(size);observer.observe(cv.parentElement!);size();if(!still)frame=requestAnimationFrame(loop)
    return()=>{observer.disconnect();cancelAnimationFrame(frame)}
  },[])
  const keys = [
    ['Home','#home','wide'],['GH',profile.github,'sky'],['IN',profile.linkedin,'insta'],
    ['@',`mailto:${profile.email}`,'tan'],['Hire me',`mailto:${profile.email}?subject=Let%27s%20work%20together`,'wide'],['X',profile.x,''],
    ['Discord',profile.discord,'wide'],['HN',profile.hashnode,'pink'],['AV',profile.avely,'blue']
  ]
  return <div className="machine-stage"><div className="machine-glow"/><section className="machine" aria-label="Contact console">
    <div className="machine-left"><div className="statusrow"><div className="lcd" role="status"><span>Available For Freelance</span><i className="led"/></div><div className="knob"/></div>
      <div className="keys"><div className="kgrid">{keys.map(([label,href,kind])=><a key={label} className={`key ${kind==='wide'?'w2':''} ${kind?`k-${kind}`:''}`} href={href} target={href.startsWith('http')?'_blank':undefined} rel="noreferrer"><span className="cap"><b>{label}</b></span></a>)}</div></div>
    </div>
    <div className="vents" aria-hidden="true">{Array.from({length:13},(_,i)=><i key={i}/>)}</div>
    <div className="scope" aria-hidden="true"><span className="screw tl"/><span className="screw tr"/><span className="screw bl"/><span className="screw br"/><div className="bezel"><div className="lip"><div className="screen"><canvas ref={canvasRef}/></div></div></div></div>
  </section></div>
}
