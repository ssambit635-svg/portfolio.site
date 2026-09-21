import { useEffect, useRef } from 'react'
import { onPointer } from '../../lib/pointer'

/**
 * Fullscreen dithered-wave background rendered with raw WebGL.
 *
 * A layered sine field is quantized through an ordered (Bayer-style)
 * dithering matrix — the retro "dither wave" texture behind the content.
 * On top of the quantized texture, three slow-drifting aurora blobs tint
 * the surface (Gemini-style glow), kept smooth and out of the dither grid
 * for a premium finish. `variant="enter"` swaps the wave field for a fan
 * of beams rising from the bottom edge.
 */

type RGB = [number, number, number]

type AuroraPalette = { a: RGB; b: RGB; c: RGB; strength: number }

type WaveCanvasProps = {
  /** RGB triples in 0..1 */
  bg?: RGB
  wave?: RGB
  aurora?: AuroraPalette
  variant?: 'home' | 'enter'
  className?: string
}

const NO_AURORA: AuroraPalette = { a: [0, 0, 0], b: [0, 0, 0], c: [0, 0, 0], strength: 0 }

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
uniform vec3 uColA;
uniform vec3 uColB;
uniform vec3 uColC;
uniform float uAurora;
uniform float uEnter; /* 0 = calm home waves, 1 = entry beam fan */
uniform vec2 uPointer; /* smoothed pointer, 0..1 in screen space */
uniform float uPointerOn; /* 0 until the visitor has moved the mouse */
uniform vec3 uGold;

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

  /* Aurora: three slow blobs of tinted glow, mixed smoothly over the
     dither texture so it stays silky instead of pixelated. */
  if (uAurora > 0.001) {
    vec2 posA = vec2(0.24 * aspect + 0.10 * sin(t * 0.21), 0.34 + 0.09 * cos(t * 0.17));
    vec2 posB = vec2(0.78 * aspect + 0.08 * cos(t * 0.15 + 1.3), 0.60 + 0.08 * sin(t * 0.19 + 0.7));
    vec2 posC = vec2(0.52 * aspect + 0.10 * sin(t * 0.13 + 2.1), 0.86 + 0.07 * cos(t * 0.14 + 3.0));

    float blobA = exp(-4.4 * length(p - posA));
    float blobB = exp(-4.8 * length(p - posB));
    float blobC = exp(-5.2 * length(p - posC));

    color = mix(color, uColA, clamp(blobA * uAurora, 0.0, 1.0));
    color = mix(color, uColB, clamp(blobB * uAurora, 0.0, 1.0));
    color = mix(color, uColC, clamp(blobC * uAurora, 0.0, 1.0));
  }

  /* Pointer lens: the dither field bends a little around the cursor, and a
     warm lamp blooms behind it — the backdrop reacts to being looked at. */
  if (uPointerOn > 0.5) {
    vec2 ptr = vec2(uPointer.x * aspect, uPointer.y);
    float dist = length(p - ptr);
    float lens = exp(-7.5 * dist);
    color += uGold * lens * 0.085;
    color = mix(color, color * 1.08, smoothstep(0.34, 0.0, dist));
  }

  /* Slow caustic shimmer so the flat fields are never quite flat */
  float caustic = sin(p.x * 26.0 + p.y * 17.0 + t * 1.35) * 0.5 + 0.5;
  color += uGold * pow(caustic, 9.0) * 0.03;

  /* Gentle vignette to seat the content in the frame */
  float vig = smoothstep(1.25, 0.45, length(uv - 0.5) * 1.4);
  color *= mix(0.92, 1.0, vig);

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

export function WaveCanvas({ bg, wave, aurora, variant = 'home', className }: WaveCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef<(() => void) | null>(null)
  const uniformsRef = useRef<{ bg: RGB; wave: RGB; aurora: AuroraPalette }>({
    bg: bg ?? [0.055, 0.055, 0.055],
    wave: wave ?? [0.16, 0.16, 0.16],
    aurora: aurora ?? NO_AURORA
  })

  /* Keep latest colors without re-creating the GL program; ask for one
     repaint in case the render loop is stopped (reduced motion). */
  uniformsRef.current = {
    bg: bg ?? uniformsRef.current.bg,
    wave: wave ?? uniformsRef.current.wave,
    aurora: aurora ?? uniformsRef.current.aurora
  }

  useEffect(() => {
    drawRef.current?.()
  }, [bg, wave, aurora])

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
    const uColA = gl.getUniformLocation(program, 'uColA')
    const uColB = gl.getUniformLocation(program, 'uColB')
    const uColC = gl.getUniformLocation(program, 'uColC')
    const uAurora = gl.getUniformLocation(program, 'uAurora')
    const uEnter = gl.getUniformLocation(program, 'uEnter')
    const uPointer = gl.getUniformLocation(program, 'uPointer')
    const uPointerOn = gl.getUniformLocation(program, 'uPointerOn')
    const uGold = gl.getUniformLocation(program, 'uGold')
    gl.uniform1f(uEnter, variant === 'enter' ? 1 : 0)
    gl.uniform3f(uGold, 0.886, 0.718, 0.416)

    /* The whole page shares one smoothed pointer; the shader just reads it. */
    const pointerState = { current: { x: 0.5, y: 0.5, active: 0 } }
    const stopPointer = onPointer((ptr) => {
      pointerState.current = ptr
    })

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
      const { bg: cBg, wave: cWave, aurora: cAurora } = uniformsRef.current
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, (performance.now() - start) / 1000)
      gl.uniform3f(uBg, cBg[0], cBg[1], cBg[2])
      gl.uniform3f(uWave, cWave[0], cWave[1], cWave[2])
      gl.uniform3f(uColA, cAurora.a[0], cAurora.a[1], cAurora.a[2])
      gl.uniform3f(uColB, cAurora.b[0], cAurora.b[1], cAurora.b[2])
      gl.uniform3f(uColC, cAurora.c[0], cAurora.c[1], cAurora.c[2])
      gl.uniform1f(uAurora, cAurora.strength)
      gl.uniform2f(uPointer, pointerState.current.x * 0.5 + 0.5, 1 - (pointerState.current.y * 0.5 + 0.5))
      gl.uniform1f(uPointerOn, pointerState.current.active)
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
      stopPointer()
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
