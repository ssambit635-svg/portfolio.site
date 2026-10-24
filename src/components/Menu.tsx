import React, { useEffect, useId, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../lib/utils'
import { setScrollLocked } from '../hooks/useLenis'

interface MenuProps {
  /** What opens the menu — a word, an icon, a name. */
  trigger: React.ReactNode
  /** The items. `MenuItem` renders them. */
  children: React.ReactNode
  /** Which edge of the trigger the panel hangs from. */
  align?: 'left' | 'right'
  /** The little chevron that says "this opens". */
  showChevron?: boolean
  /** Accessible name for the whole widget. */
  label?: string
  /** Freeze the page behind the panel while it is open (mobile). */
  lockScroll?: boolean
  className?: string
  panelClassName?: string
}

/**
 * A dropdown.
 *
 * The panel is a real `role="menu"` with real `role="menuitem"` children, and
 * it closes on Escape, on a click outside and on a click of any item — a menu
 * that stays open over the page it just navigated to is a menu that lies.
 */
export function Menu({
  trigger,
  children,
  align = 'left',
  showChevron = true,
  label = 'Menu',
  lockScroll = false,
  className,
  panelClassName
}: MenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!isOpen) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (target && !rootRef.current?.contains(target)) setIsOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setIsOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isOpen])

  // A panel that floats over the page should not let the page keep moving
  // under it — on a phone that reads as the menu jumping while you read it.
  useEffect(() => {
    if (!isOpen || !lockScroll) return
    setScrollLocked(true)
    return () => setScrollLocked(false)
  }, [isOpen, lockScroll])

  return (
    <div ref={rootRef} className={cn('menu-root relative inline-block text-left', className)}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(open => !open)}
        className="menu-trigger inline-flex cursor-pointer items-center"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-controls={panelId}
        aria-label={label}
      >
        {trigger}
        {showChevron && <ChevronDown className="menu-chevron ml-2 -mr-1 h-4 w-4" aria-hidden="true" />}
      </button>

      {isOpen && (
        <div
          id={panelId}
          className={cn('menu-panel absolute mt-2 z-50 w-56', align === 'right' ? 'right-0' : 'left-0', panelClassName)}
          role="menu"
          aria-orientation="vertical"
          aria-label={label}
          onClick={event => {
            // Choosing an item is the end of the menu, whatever the item did.
            if ((event.target as HTMLElement).closest('[role="menuitem"]')) setIsOpen(false)
          }}
        >
          <div className="py-1" role="none">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

interface MenuItemProps {
  children?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  icon?: React.ReactNode
  isActive?: boolean
  /** Renders the item as a link instead of a button. */
  href?: string
  target?: string
  rel?: string
  /** The accessible name, for items that are only an icon. */
  ariaLabel?: string
  /** A small label that appears beside the item on hover. */
  chip?: string
  title?: string
  className?: string
}

/**
 * One line of a menu.
 *
 * It is a button unless it has an `href`, in which case it is a link — the
 * difference matters to the keyboard and to the crawlers, and a menu of
 * sections is mostly links.
 */
export function MenuItem({
  children,
  onClick,
  disabled = false,
  icon,
  isActive = false,
  href,
  target,
  rel,
  ariaLabel,
  chip,
  title,
  className
}: MenuItemProps) {
  const classes = cn(
    'menu-item relative block w-full text-center group',
    disabled ? 'cursor-not-allowed opacity-40' : 'cursor-pointer',
    isActive && 'menu-item-active',
    className
  )

  const inner = (
    <span className="flex h-full items-center justify-center">
      {icon && <span className="menu-item-icon h-6 w-6 shrink-0 transition-all duration-200 group-hover:[&_svg]:stroke-[2.5]">{icon}</span>}
      {children}
    </span>
  )

  const chipNode = chip ? <span className="menu-chip" aria-hidden="true">{chip}</span> : null

  if (href && !disabled) {
    return (
      <a
        className={classes}
        role="menuitem"
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        aria-label={ariaLabel}
        title={title}
      >
        {inner}
        {chipNode}
      </a>
    )
  }

  return (
    <button
      type="button"
      className={classes}
      role="menuitem"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      title={title}
    >
      {inner}
      {chipNode}
    </button>
  )
}
