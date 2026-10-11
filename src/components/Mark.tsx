import { cn } from '../lib/utils'

/** Nested triangle — the existing mark, redrawn as a vector so it scales. */
export default function Mark({ className, title = 'Sambit Swain' }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={cn('shrink-0', className)}
      aria-hidden={!title}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      <rect width="64" height="64" rx="14" fill="currentColor" />
      <path
        fill="none"
        stroke="#f3efe7"
        strokeWidth="4.2"
        strokeLinejoin="miter"
        d="M32 12 L54 52 H10 Z"
      />
      <path
        fill="none"
        stroke="#f3efe7"
        strokeWidth="3.4"
        d="M32 22 L46 48 H18 Z"
      />
      <path fill="#f3efe7" d="M32 32 L39.2 46 H24.8 Z" />
    </svg>
  )
}
