import { useEffect, useState } from 'react'
import {
  AtSign,
  BadgeCheck,
  Briefcase,
  FileText,
  FolderGit2,
  House,
  Layers,
  Link2,
  Mail,
  MessageCircle,
  ScrollText,
  User,
} from 'lucide-react'
import { Menu, MenuItem } from './Menu'
import { profile } from '../lib/site'
import { useMediaQuery } from '../hooks/useMediaQuery'

/** The pages of the site. */
const sections = [
  { label: 'Home', href: '#home', Icon: House },
  { label: 'Works', href: '#works', Icon: Briefcase },
  { label: 'Certified', href: '#certified', Icon: BadgeCheck },
  { label: 'Skills', href: '#skills', Icon: Layers },
  { label: 'Ask Emo', href: '#ask', Icon: MessageCircle },
  { label: 'About me', href: '#about', Icon: User },
  { label: 'Contact', href: '#contact', Icon: Mail },
]

/** The ways to reach the person behind the pages. */
const actions = [
  { label: 'Email me', href: `mailto:${profile.email}`, Icon: Mail, external: false },
  { label: 'GitHub', href: profile.github, Icon: FolderGit2, external: true },
  { label: 'LinkedIn', href: profile.linkedin, Icon: Link2, external: true },
  { label: 'X', href: profile.x, Icon: AtSign, external: true },
  { label: 'One-page CV', href: 'cv/', Icon: ScrollText, external: false },
  { label: 'Certificates', href: 'dashboard/', Icon: FileText, external: false },
]

/**
 * The site's one menu: a single MENU panel in the top-right corner, on every
 * screen size. The panel holds the sections and the ways to reach the author;
 * the monogram top-left goes home.
 */
export default function SiteMenu() {
  const isCompact = useMediaQuery('(max-width: 960px)')
  const [chrome, setChrome] = useState({ hidden: false, scrolled: false })

  /*
   * On a phone the menu floats over the page, and body copy used to run straight
   * under the monogram and the pill. Collapse the chrome while the page is moving
   * down, bring it back the moment the reader scrolls up (or stops at the top),
   * and fade a soft scrim in behind it so nothing reads through the mark. On a
   * pointer device nothing changes.
   */
  useEffect(() => {
    if (!isCompact) {
      setChrome({ hidden: false, scrolled: false })
      return
    }
    let lastY = window.scrollY
    let frame = 0
    const update = () => {
      frame = 0
      const y = window.scrollY
      const delta = y - lastY
      if (Math.abs(delta) < 5) return
      // Never fold the chrome away while its own panel is open.
      const panelOpen = Boolean(document.querySelector('.menu-panel'))
      const hidden = y > 120 && delta > 0 && !panelOpen
      const scrolled = y > 24
      lastY = y
      setChrome((previous) =>
        previous.hidden === hidden && previous.scrolled === scrolled
          ? previous
          : { hidden, scrolled },
      )
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [isCompact])

  return (
    <div
      className={`site-menu${chrome.hidden ? ' is-hidden' : ''}${chrome.scrolled ? ' is-scrolled' : ''}`}
    >
      <div className="site-menu-scrim" aria-hidden="true" />
      <a className="nav-name" href="#home" aria-label="Sambit Swain — home">
        <svg viewBox="0 0 32 32" aria-hidden="true" focusable="false">
          <g fill="none" stroke="currentColor" strokeLinejoin="miter">
            <path d="M16 3 L29 27 H3 Z" strokeWidth="2.6" />
            <path d="M16 10.5 L24 24.5 H8 Z" strokeWidth="2" />
          </g>
          <path fill="currentColor" d="M16 16.5 L19.6 23.5 H12.4 Z" />
        </svg>
      </a>

      <div className="site-menu-actions">
        <Menu align="right" label="Menu" lockScroll={isCompact} trigger={<span>Menu</span>}>
          <div className="menu-group menu-group-sections">
            {sections.map(({ label, href, Icon }) => (
              <MenuItem key={href} href={href} icon={<Icon />} className="menu-item-row">
                {label}
              </MenuItem>
            ))}
          </div>
          <div className="menu-group menu-group-actions">
            {actions.map(({ label, href, Icon, external }) => (
              <MenuItem
                key={label}
                href={href}
                icon={<Icon />}
                target={external ? '_blank' : undefined}
                rel={external ? 'noreferrer' : undefined}
                className="menu-item-row"
              >
                {label}
              </MenuItem>
            ))}
          </div>
        </Menu>
      </div>
    </div>
  )
}
