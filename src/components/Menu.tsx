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

interface MenuContainerProps {
  /** The first child is the orb that is always visible; the rest unroll below it. */
  children: React.ReactNode
  label?: string
  className?: string
}

/**
 * A cluster of orbs.
 *
 * The first child stays put and is the handle; the others are stacked behind
 * it and unroll downwards when it is pressed. The stack is drawn as circles
 * clipped to a disc, so the orbs read as a roll of coins rather than as a
 * column of boxes.
 */
export function MenuContainer({ children, label = 'Menu', className }: MenuContainerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const childrenArray = React.Children.toArray(children)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isExpanded) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (target && !rootRef.current?.contains(target)) setIsExpanded(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsExpanded(false)
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown, true)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [isExpanded])

  const handleToggle = () => setIsExpanded(open => !open)

  return (
    <div ref={rootRef} className={cn('menu-cluster relative w-16', className)} data-expanded={isExpanded}>
      <div className="relative">
        {/* The handle: always visible, and the thing you press. */}
        <div
          className="menu-cluster-trigger relative grid h-16 w-16 cursor-pointer place-items-center rounded-full"
          role="button"
          tabIndex={0}
          aria-expanded={isExpanded}
          aria-label={label}
          onClick={handleToggle}
          onKeyDown={event => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              handleToggle()
            }
          }}
        >
          {childrenArray[0]}
        </div>

        {/* The rest, unrolled one disc at a time. */}
        {childrenArray.slice(1).map((child, index) => {
          const style = {
            transform: `translateY(${isExpanded ? (index + 1) * 48 : 0}px)`,
            opacity: isExpanded ? 1 : 0,
            zIndex: 40 - index,
            // The disc is clipped, not the item: the clip belongs to the drawn
            // circle, so the label that sits beside the orb is not cut off
            // with it. The shape of the clip is the stacked-disc one.
            '--orb-clip': index === childrenArray.length - 2 ? 'circle(50% at 50% 50%)' : 'circle(50% at 50% 55%)',
            transition: `transform ${isExpanded ? '300ms' : '300ms'} cubic-bezier(0.4, 0, 0.2, 1),
                       opacity ${isExpanded ? '300ms' : '350ms'}`,
            backfaceVisibility: 'hidden',
            perspective: 1000,
            WebkitFontSmoothing: 'antialiased',
            pointerEvents: isExpanded ? 'auto' : 'none'
          } as React.CSSProperties
          return (
            <div
              key={index}
              className="menu-cluster-item absolute top-0 left-0 h-16 w-16"
              style={style}
              inert={!isExpanded}
              onClick={() => setIsExpanded(false)}
            >
              {child}
            </div>
          )
        })}
      </div>
    </div>
  )
}
