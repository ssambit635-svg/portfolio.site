const boxes = {
  client: [
    { id: 'web', x: 16, y: 18, w: 88, h: 36, t: 'Web' },
    { id: 'and', x: 116, y: 18, w: 88, h: 36, t: 'Android' }
  ],
  edge: [{ id: 'edge', x: 66, y: 78, w: 108, h: 32, t: 'HTTPS / edge' }],
  app: [
    { id: 'react', x: 16, y: 134, w: 92, h: 36, t: 'React' },
    { id: 'cap', x: 120, y: 134, w: 92, h: 36, t: 'Capacitor' }
  ],
  api: [
    { id: 'ex', x: 16, y: 198, w: 92, h: 36, t: 'Express' },
    { id: 'fa', x: 120, y: 198, w: 92, h: 36, t: 'FastAPI' }
  ],
  data: [
    { id: 'sql', x: 16, y: 262, w: 92, h: 36, t: 'SQLite' },
    { id: 'mo', x: 120, y: 262, w: 92, h: 36, t: 'Mongo' }
  ],
  infra: [
    { id: 'dock', x: 8, y: 330, w: 68, h: 36, t: 'Docker' },
    { id: 'aws', x: 84, y: 330, w: 68, h: 36, t: 'AWS' },
    { id: 'ren', x: 160, y: 330, w: 68, h: 36, t: 'Render' }
  ]
}

export default function InfraDiagram() {
  return (
    <figure className="border border-line bg-paper-2 p-3 md:p-4">
      <svg viewBox="0 0 236 390" className="h-auto w-full text-ink" role="img" aria-labelledby="infra-title infra-desc">
        <title id="infra-title">How a typical Sambit stack is wired</title>
        <desc id="infra-desc">
          Clients on the web and Android hit HTTPS, then React and Capacitor, Express or FastAPI, SQLite or Mongo, then Docker, AWS and Render.
        </desc>
        <defs>
          <marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0 0 L8 4 L0 8 Z" fill="currentColor" />
          </marker>
        </defs>

        <text x="16" y="12" className="fill-mute" fontFamily="IBM Plex Mono, ui-monospace, monospace" fontSize="8" letterSpacing="1.4">
          CLIENT
        </text>
        {boxes.client.map((b) => (
          <g key={b.id}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#f3efe7" stroke="currentColor" strokeWidth="1" />
            <text x={b.x + b.w / 2} y={b.y + 23} textAnchor="middle" fontFamily="Inter, system-ui" fontSize="12">
              {b.t}
            </text>
          </g>
        ))}
        <line x1="60" y1="54" x2="120" y2="78" stroke="currentColor" strokeWidth="1" markerEnd="url(#arr)" />
        <line x1="160" y1="54" x2="120" y2="78" stroke="currentColor" strokeWidth="1" markerEnd="url(#arr)" />

        <text x="16" y="72" className="fill-mute" fontFamily="IBM Plex Mono, ui-monospace, monospace" fontSize="8" letterSpacing="1.4">
          EDGE
        </text>
        {boxes.edge.map((b) => (
          <g key={b.id}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#f3efe7" stroke="currentColor" strokeWidth="1" />
            <text x={b.x + b.w / 2} y={b.y + 21} textAnchor="middle" fontFamily="Inter, system-ui" fontSize="11">
              {b.t}
            </text>
          </g>
        ))}
        <line x1="120" y1="110" x2="120" y2="134" stroke="currentColor" strokeWidth="1" markerEnd="url(#arr)" />

        <text x="16" y="128" className="fill-mute" fontFamily="IBM Plex Mono, ui-monospace, monospace" fontSize="8" letterSpacing="1.4">
          APP
        </text>
        {boxes.app.map((b) => (
          <g key={b.id}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#f3efe7" stroke="currentColor" strokeWidth="1" />
            <text x={b.x + b.w / 2} y={b.y + 23} textAnchor="middle" fontFamily="Inter, system-ui" fontSize="12">
              {b.t}
            </text>
          </g>
        ))}
        <line x1="62" y1="170" x2="62" y2="198" stroke="currentColor" strokeWidth="1" markerEnd="url(#arr)" />
        <line x1="166" y1="170" x2="166" y2="198" stroke="currentColor" strokeWidth="1" markerEnd="url(#arr)" />

        <text x="16" y="192" className="fill-mute" fontFamily="IBM Plex Mono, ui-monospace, monospace" fontSize="8" letterSpacing="1.4">
          API
        </text>
        {boxes.api.map((b) => (
          <g key={b.id}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#161513" />
            <text x={b.x + b.w / 2} y={b.y + 23} textAnchor="middle" fill="#f3efe7" fontFamily="Inter, system-ui" fontSize="12">
              {b.t}
            </text>
          </g>
        ))}
        <line x1="62" y1="234" x2="62" y2="262" stroke="currentColor" strokeWidth="1" markerEnd="url(#arr)" />
        <line x1="166" y1="234" x2="166" y2="262" stroke="currentColor" strokeWidth="1" markerEnd="url(#arr)" />

        <text x="16" y="256" className="fill-mute" fontFamily="IBM Plex Mono, ui-monospace, monospace" fontSize="8" letterSpacing="1.4">
          DATA
        </text>
        {boxes.data.map((b) => (
          <g key={b.id}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#f3efe7" stroke="currentColor" strokeWidth="1" />
            <text x={b.x + b.w / 2} y={b.y + 23} textAnchor="middle" fontFamily="Inter, system-ui" fontSize="12">
              {b.t}
            </text>
          </g>
        ))}
        <line x1="62" y1="298" x2="42" y2="330" stroke="currentColor" strokeWidth="1" markerEnd="url(#arr)" />
        <line x1="120" y1="298" x2="118" y2="330" stroke="currentColor" strokeWidth="1" markerEnd="url(#arr)" />
        <line x1="166" y1="298" x2="194" y2="330" stroke="currentColor" strokeWidth="1" markerEnd="url(#arr)" />

        <text x="16" y="324" className="fill-mute" fontFamily="IBM Plex Mono, ui-monospace, monospace" fontSize="8" letterSpacing="1.4">
          INFRA
        </text>
        {boxes.infra.map((b) => (
          <g key={b.id}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} fill="#f3efe7" stroke="currentColor" strokeWidth="1" />
            <text x={b.x + b.w / 2} y={b.y + 23} textAnchor="middle" fontFamily="Inter, system-ui" fontSize="11">
              {b.t}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="t-kicker mt-3 text-mute">Typical path · client → edge → app → api → data → infra</figcaption>
    </figure>
  )
}
