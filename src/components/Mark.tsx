import { cn } from '../lib/utils'

/**
 * Nested triangle — the existing mark, redrawn as a vector so it scales.
 * The inner triangle is cut out in the surface behind it (--mark-cut), so the
 * mark stays legible on paper, near-black and violet chrome alike.
 */
export default function Mark({ className, label }: { className?: string; label?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn('shrink-0', className)}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <rect width="64" height="64" rx="14" fill="currentColor" />
      <path
        fill="none"
        stroke="var(--mark-cut, #f3efe7)"
        strokeWidth="4.2"
        strokeLinejoin="miter"
        d="M32 12 L54 52 H10 Z"
      />
      <path fill="none" stroke="var(--mark-cut, #f3efe7)" strokeWidth="3.4" d="M32 22 L46 48 H18 Z" />
      <path fill="var(--mark-cut, #f3efe7)" d="M32 32 L39.2 46 H24.8 Z" />
    </svg>
  )
}
