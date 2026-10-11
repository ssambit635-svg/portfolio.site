import { cn } from '../../lib/utils'

export default function Tag({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
  tone?: string
}) {
  return (
    <span className={cn('t-kicker text-mute', className)}>
      {children}
    </span>
  )
}
