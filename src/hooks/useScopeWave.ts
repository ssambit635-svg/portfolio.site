import { useEffect, type RefObject } from 'react'

/** Live phosphor oscilloscope trace — wide green pass + hot core, with persistence fade. */
export function useScopeWave(canvasRef: RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const cv = canvasRef.current
    if (!cv) return
    const ctx = cv.getContext('2d')
    if (!ctx) return
    let frame = 0, w = 0, h = 0
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const size = () => { const r = cv.getBoundingClientRect(), d = Math.min(devicePixelRatio || 1, 2); w = r.width; h = r.height; cv.width = w * d; cv.height = h * d; ctx.setTransform(d, 0, 0, d, 0, 0); draw(1.3) }
    const wave = (x: number, t: number) => .5 - .27 * (.58 + .42 * Math.sin(x * 5.2 - t * .9) * Math.sin(x * 2.1 + t * .37)) * (Math.sin(x * 34 - t * 7.5) * .82 + Math.sin(x * 79 - t * 11) * .18) * Math.pow(Math.sin(Math.PI * x), .6)
    const draw = (t: number) => {
      ctx.globalCompositeOperation = 'destination-out'; ctx.fillStyle = still ? '#000' : 'rgba(0,0,0,.24)'; ctx.fillRect(0, 0, w, h); ctx.globalCompositeOperation = 'source-over'; ctx.lineJoin = 'round'; ctx.lineCap = 'round'
      const pass = (color: string, width: number, blur: number) => { ctx.beginPath(); for (let x = 0; x <= w; x += 2) { const y = wave(x / w, t) * h + (still ? 0 : (Math.random() - .5) * .7); x ? ctx.lineTo(x, y) : ctx.moveTo(x, y) } ctx.shadowColor = 'rgba(60,255,60,.9)'; ctx.shadowBlur = blur; ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke() }
      pass('rgba(70,255,70,.4)', 6.5, 18); pass('#8dff6a', 2.4, 8); pass('#e4ffd8', .9, 0); ctx.shadowBlur = 0
    }
    const loop = (n: number) => { draw(n / 1000); frame = requestAnimationFrame(loop) }
    const observer = new ResizeObserver(size); observer.observe(cv.parentElement!); size(); if (!still) frame = requestAnimationFrame(loop)
    return () => { observer.disconnect(); cancelAnimationFrame(frame) }
  }, [canvasRef])
}
