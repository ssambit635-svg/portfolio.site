import { useEffect, useRef } from 'react'

/**
 * Fullscreen dithered-wave background rendered with raw WebGL.
 *
 * A layered sine field is quantized through an ordered (Bayer-style)
 * dithering matrix, which produces the retro "dither wave" texture behind
 * the content. `variant="enter"` adds a radial beam fan rising from the
 * bottom edge for the entry screen.
 */

type WaveCanvasProps = {
  /** RGB triples in 0..1 */
  bg?: [number, number, number]
  wave?: [number, number, number]
  variant?: 'home' | 'enter'
  className?: string
}

/* Lets the color-prop effect request a one-off repaint in reduced-motion mode. */

const VERT = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`

const FRAG = `
precision highp float;

uniform vec2 uRes;
uniform float uTime;
uniform vec3 uBg;
uniform vec3 uWave;
uniform float uEnter; /* 0 = calm home waves, 1 = entry beam fan */

/* Ordered-dither threshold, built recursively from a 2x2 matrix.
   (0,0)=0 (1,0)=2 (0,1)=3 (1,1)=1 */
float bayer2(vec2 v) {
  return mod(2.0 * v.x + 3.0 * v.y, 4.0);
}

float bayer4(vec2 p) {
  vec2 low = floor(mod(p, 2.0));
  vec2 high = floor(mod(p * 0.5, 2.0));
  return (bayer2(high) * 4.0 + bayer2(low)) / 16.0;
}

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes.xy;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);

  float t = uTime;

  /* Layered drifting sine field */
  float field = 0.0;
  field += sin(p.x * 4.1 + t * 0.9 + p.y * 2.3) * 0.55;
  field += sin(p.x * 7.9 - t * 0.6 - p.y * 4.2) * 0.30;
  field += sin((p.x + p.y) * 11.3 + t * 1.7) * 0.15;

  /* Home: waves concentrate around a horizon band.
     Enter: a fan of beams rising from the bottom centre. */
  float v;
  if (uEnter > 0.5) {
    vec2 origin = vec2(0.5, -0.08);
    vec2 d = vec2((uv.x - origin.x) * aspect, uv.y - origin.y);
    float angle = atan(d.y, abs(d.x) + 0.001) / 3.14159;
    float radius = length(d);
    float fan = sin(angle * 34.0 + field * 1.6 + t * 0.5) * 0.5 + 0.5;
    float cone = smoothstep(1.15, 0.12, radius) * smoothstep(0.0, 0.16, d.y);
    v = pow(fan, 2.4) * cone;
    v += (hash(gl_FragCoord.xy + t) - 0.5) * 0.05;
  } else {
    float horizon = 0.52 + field * 0.14;
    float band = 1.0 - smoothstep(0.0, 0.55, abs(uv.y - horizon));
    v = band * (0.55 + field * 0.28);
    v = clamp(v, 0.0, 1.0);
  }

  /* Ordered dithering → quantize the field into 3 brightness steps */
  float d = bayer4(gl_FragCoord.xy);
  float levels = 3.0;
  float q = clamp(floor(v * levels + d) / (levels - 1.0), 0.0, 1.0);

  vec3 color = mix(uBg, uWave, q);
  gl_FragColor = vec4(color, 1.0);
}
`

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export function WaveCanvas({ bg, wave, variant = 'home', className }: WaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef<(() => void) | null>(null)
  const uniformsRef = useRef<{ bg: [number, number, number]; wave: [number, number, number] }>({
    bg: bg ?? [0.055, 0.055, 0.055],
    wave: wave ?? [0.16, 0.16, 0.16]
  })

  /* Keep latest colors without re-creating the GL program; ask for one
     repaint in case the render loop is stopped (reduced motion). */
  uniformsRef.current = {
    bg: bg ?? uniformsRef.current.bg,
    wave: wave ?? uniformsRef.current.wave
  }

  useEffect(() => {
    drawRef.current?.()
  }, [bg, wave])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let gl: WebGLRenderingContext | null = null
    try {
      gl = canvas.getContext('webgl', {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'low-power'
      })
    } catch {
      /* jsdom / no-GPU environments — the CSS background still carries the theme. */
      return
    }
    if (!gl) return

    const vs = compile(gl, gl.VERTEX_SHADER, VERT)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
    if (!vs || !fs) return
    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const aPos = gl.getAttribLocation(program, 'aPos')
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    const uRes = gl.getUniformLocation(program, 'uRes')
    const uTime = gl.getUniformLocation(program, 'uTime')
    const uBg = gl.getUniformLocation(program, 'uBg')
    const uWave = gl.getUniformLocation(program, 'uWave')
    const uEnter = gl.getUniformLocation(program, 'uEnter')
    gl.uniform1f(uEnter, variant === 'enter' ? 1 : 0)

    let raf = 0
    const start = performance.now()

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const width = Math.floor(canvas.clientWidth * dpr)
      const height = Math.floor(canvas.clientHeight * dpr)
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const draw = () => {
      resize()
      const { bg: cBg, wave: cWave } = uniformsRef.current
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, (performance.now() - start) / 1000)
      gl.uniform3f(uBg, cBg[0], cBg[1], cBg[2])
      gl.uniform3f(uWave, cWave[0], cWave[1], cWave[2])
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    const frame = () => {
      draw()
      if (!reduced) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    /* Reduced-motion visitors get a static shader, but it must still
       repaint when the theme flips its colours. */
    drawRef.current = reduced ? draw : null

    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
      } else if (!reduced) {
        raf = requestAnimationFrame(frame)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('resize', resize)

    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', resize)
      gl.deleteProgram(program)
      gl.deleteShader(vs)
      gl.deleteShader(fs)
      gl.deleteBuffer(buffer)
    }
  }, [variant])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
