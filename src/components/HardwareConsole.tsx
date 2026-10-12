import { profile } from '../lib/site'
import macbook from '../assets/macbook-pro-front.jpg'
import '../hardware-console.css'

const ICONS = {
  github: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12',
  linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.777 13.019H3.56V9h3.554v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  x: 'M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z',
  discord: 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z',
  hashnode: 'M22.351 8.019l-6.37-6.37a5.63 5.63 0 00-7.962 0l-6.37 6.37a5.63 5.63 0 000 7.962l6.37 6.37a5.63 5.63 0 007.962 0l6.37-6.37a5.63 5.63 0 000-7.962zM12 15.953a3.953 3.953 0 110-7.906 3.953 3.953 0 010 7.906z',
  mail: 'M2 4.5A2.5 2.5 0 014.5 2h15A2.5 2.5 0 0122 4.5v15a2.5 2.5 0 01-2.5 2.5h-15A2.5 2.5 0 012 19.5v-15zm2.2 1.1l7.3 5.4 7.3-5.4a1 1 0 00-.6-.2h-13.4a1 1 0 00-.6.2zm13.6 2.3l-6.8 5a1.5 1.5 0 01-1.8 0l-6.8-5v9.6a1 1 0 001 1h13.4a1 1 0 001-1V7.9z',
  user: 'M12 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9zm0 2c-4.2 0-8 2.1-8 5v2h16v-2c0-2.9-3.8-5-8-5z',
  link: 'M10.6 13.2a1.5 1.5 0 002.1 0l3.1-3.1a3.5 3.5 0 00-5-5l-1.2 1.2a.75.75 0 101.1 1l1.2-1.2a2 2 0 012.8 2.8l-3 3a.75.75 0 000 1.1.75.75 0 001.1 0l.9-.9-1 1 1-1zm-5.2-1.2a1.5 1.5 0 000 2.1l3.1 3.1a3.5 3.5 0 005-5l-1.2-1.2a.75.75 0 10-1 1.1l1.2 1.2a2 2 0 01-2.8 2.8l-3-3a.75.75 0 00-1.1 0 .75.75 0 000 1.1l-.9.9 1-1-1 1z',
} as const

type Card = { id: string; label: string; sub: string; href: string; kind: string; icon: keyof typeof ICONS; wide?: boolean }

const MAIL_SUBJECT = 'Let%27s%20work%20together'

const CARDS: Card[] = [
  { id: 'email', label: 'Email', sub: profile.email, href: `mailto:${profile.email}`, kind: 'mail', icon: 'mail', wide: true },
  { id: 'gh', label: 'GitHub', sub: '@ssambit635', href: profile.github, kind: 'gh', icon: 'github' },
  { id: 'in', label: 'LinkedIn', sub: 'Connect', href: profile.linkedin, kind: 'in', icon: 'linkedin' },
  { id: 'x', label: 'X', sub: '@swainsambit7i', href: profile.x, kind: 'x', icon: 'x' },
  { id: 'discord', label: 'Discord', sub: 'Chat', href: profile.discord, kind: 'discord', icon: 'discord' },
  { id: 'hashnode', label: 'Hashnode', sub: 'Blog', href: profile.hashnode, kind: 'hashnode', icon: 'hashnode' },
  { id: 'avely', label: 'Avely', sub: 'Profile', href: profile.avely, kind: 'avely', icon: 'user' },
  { id: 'hire', label: 'Hire me', sub: profile.availability, href: `mailto:${profile.email}?subject=${MAIL_SUBJECT}`, kind: 'hire', icon: 'mail', wide: true },
]

function Icon({ name }: { name: keyof typeof ICONS }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d={ICONS[name]} /></svg>
}

/** Contact console — one component, styled responsively by hardware-console.css. */
export default function HardwareConsole() {
  return (
    <div className="machine-stage">
      <div className="machine-glow" aria-hidden="true" />
      <div className="macbook-frame">
        <img src={macbook} alt="" />
        <div className="macbook-screen">
          <section className="mac-window" aria-labelledby="contact-title">
            <div className="mac-titlebar">
              <div className="mac-dots" aria-hidden="true"><i /><i /><i /></div>
              <div className="mac-title">sambit@portfolio — Contact — zsh — 80×24</div>
              <div className="mac-actions" aria-hidden="true">○ ◻ ×</div>
            </div>
            <div className="mac-body">
              <div className="mac-left">
                <p className="mac-kicker">Contact • {profile.availability}</p>
                <h3 id="contact-title">Let&apos;s make it <br /><em>run —</em></h3>
                <p style={{ margin: '2px 0 0', color: '#8a8a8a', fontSize: 11, lineHeight: 1.5 }}>
                  Full-stack & cloud • {profile.classTag} @ NIST • {profile.city}.
                </p>
                <a className="mac-email" href={`mailto:${profile.email}`}>
                  <span className="mac-icon" style={{ width: 28, height: 28, borderRadius: 7 }}><Icon name="mail" /></span>
                  <b>{profile.email}</b>
                </a>
                <div className="mac-meta">
                  <span className="mac-pill"><i className="led" /> {profile.availability}</span>
                  <span className="mac-pill">{profile.coords.join(' • ')}</span>
                </div>
              </div>
              <div className="mac-right">
                <div className="mac-grid-label"><span>Quick connect</span><span>{CARDS.length} ways • pick one</span></div>
                <div className="mac-grid">
                  {CARDS.map((c) => (
                    <a key={c.id} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className={`mac-card ${c.wide ? 'wide' : ''}`} data-kind={c.kind} aria-label={c.label}>
                      <span className="mac-icon"><Icon name={c.icon} /></span>
                      <span className={c.wide ? 'mac-text' : ''} style={c.wide ? undefined : { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <span className="mac-label">{c.label}</span>
                        <span className="mac-sub">{c.sub}</span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
