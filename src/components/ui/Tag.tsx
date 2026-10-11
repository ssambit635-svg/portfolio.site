import { cn } from '../../lib/utils'

/**
 * Small section eyebrow.
 * `ink`   — dark badge, for the violet Toolbox block.
 * `violet` — violet badge, for the near-black Learning block.
 * `plain` — bare muted label, for paper sections.
 */
export default function Tag({
  children,
  className,
  tone = 'plain'
}: {
  children: React.ReactNode
  className?: string
  tone?: 'plain' | 'ink' | 'violet'
}) {
  return (
    <span
      className={cn(
        't-label inline-block font-semibold',
        tone === 'plain' && 'text-mute',
        tone === 'ink' && 'notch-tag bg-ink px-3 py-[5px] text-violet',
        tone === 'violet' && 'notch-tag bg-violet px-3 py-[5px] text-ink',
        className
      )}
    >
      {children}
    </span>
  )
}
