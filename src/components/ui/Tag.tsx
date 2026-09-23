import { cn } from '../../lib/utils'

export default function Tag({ children, className, tone = 'lime' }: { children: React.ReactNode; className?: string; tone?: 'lime' | 'ink' }) {
  return (
    <span
      className={cn(
        't-label notch-tag inline-block px-3 py-[5px] font-semibold',
        tone === 'lime' ? 'bg-lime text-ink' : 'bg-ink text-lime',
        className
      )}
    >
      {children}
    </span>
  )
}
