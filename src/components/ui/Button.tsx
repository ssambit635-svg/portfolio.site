import { cn } from '../../lib/utils'

type Props = React.ComponentPropsWithoutRef<'a'> & { tone?: 'ink' | 'paper' | 'ghost' }

export default function Button({ className, children, tone = 'ink', ...rest }: Props) {
  return (
    <a
      className={cn(
        't-kicker inline-flex min-h-11 items-center gap-2 px-4 py-2.5 transition-colors',
        tone === 'ink' && 'bg-ink text-paper hover:bg-rust',
        tone === 'paper' && 'bg-paper text-ink hover:bg-paper-2',
        tone === 'ghost' && 'border border-current hover:bg-ink hover:text-paper',
        className
      )}
      {...rest}
    >
      {children}
    </a>
  )
}
