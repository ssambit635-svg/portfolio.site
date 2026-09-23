import { cn } from '../../lib/utils'
import { useSound } from '../../hooks/useSound'

type Props = React.ComponentPropsWithoutRef<'a'> & { as?: 'a' | 'button'; onClick?: () => void }

export default function Button({ className, children, as = 'a', onClick, ...rest }: Props) {
  const { click, tick } = useSound()
  const cls = cn(
    't-label inline-flex items-center gap-2 border px-5 py-3 font-semibold transition-colors duration-200',
    '[border-color:var(--hd-btn-bd)] [color:var(--hd-btn-fg)] hover:[background:var(--hd-btn-bd)]',
    className
  )
  if (as === 'button')
    return (
      <button className={cls} onMouseEnter={tick} onClick={() => { click(); onClick?.() }}>
        {children}
      </button>
    )
  return (
    <a className={cls} onMouseEnter={tick} onClick={click} {...rest}>
      {children}
    </a>
  )
}
