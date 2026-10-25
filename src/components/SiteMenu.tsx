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

  return (
    <div className="site-menu">
      <a className="nav-name" href="#home" aria-label="SS — home">
        SS
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
