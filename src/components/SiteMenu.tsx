import { AtSign, BadgeCheck, Briefcase, FileText, FolderGit2, House, LayoutGrid, Link2, Mail, User, X } from 'lucide-react'
import { Menu, MenuContainer, MenuItem } from './Menu'
import { profile } from '../lib/site'
import { useMediaQuery } from '../hooks/useMediaQuery'

/** The pages of the site. */
const sections = [
  { label: 'Home', href: '#home', Icon: House },
  { label: 'Works', href: '#works', Icon: Briefcase },
  { label: 'Certified', href: '#certified', Icon: BadgeCheck },
  { label: 'About me', href: '#about', Icon: User },
  { label: 'Contact', href: '#contact', Icon: Mail }
]

/** The ways to reach the person behind the pages. */
const actions = [
  { label: 'Email me', href: `mailto:${profile.email}`, Icon: Mail, external: false },
  { label: 'GitHub', href: profile.github, Icon: FolderGit2, external: true },
  { label: 'LinkedIn', href: profile.linkedin, Icon: Link2, external: true },
  { label: 'X', href: profile.x, Icon: AtSign, external: true },
  { label: 'Certificates', href: 'dashboard/', Icon: FileText, external: false }
]

/**
 * The site's menu.
 *
 * On a desk the sections are a cluster of orbs in the corner — one handle, and
 * the pages unroll out of it. On a phone the same sections drop into the
 * panel of a single button, because a fan of orbs over a small screen is a
 * game of blind faith, not a menu. The ways to write to the author sit in the
 * panel on both.
 */
export default function SiteMenu() {
  const isCompact = useMediaQuery('(max-width: 960px)')

  return (
    <div className="site-menu">
      <a className="nav-name" href="#home" aria-label="Sambit Swain — home">SS</a>

      <nav className="site-menu-cluster" aria-label="Sections">
        <MenuContainer label="Sections">
          <span className="menu-orb-icon" aria-hidden="true">
            <LayoutGrid className="menu-orb-mark-open" />
            <X className="menu-orb-mark-close" />
          </span>
          {sections.map(({ label, href, Icon }) => (
            <MenuItem
              key={href}
              href={href}
              icon={<Icon />}
              chip={label}
              ariaLabel={label}
              className="menu-orb"
            />
          ))}
        </MenuContainer>
      </nav>

      <div className="site-menu-actions">
        <Menu
          align="right"
          label="Menu"
          lockScroll={isCompact}
          trigger={<span>Menu</span>}
        >
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
