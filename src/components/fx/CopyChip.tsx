import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { useSound } from '../../context/SoundContext'
import { cn } from '../../lib/utils'

/**
 * Copy-to-clipboard chip with real feedback: the icon morphs into a check,
 * a chime plays (if sound is on) and a toast confirms what was copied.
 * Falls back to a hidden textarea for browsers without the async API.
 */

async function writeClipboard(text: string) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const area = document.createElement('textarea')
    area.value = text
    area.setAttribute('readonly', '')
    area.style.position = 'fixed'
    area.style.top = '-1000px'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  } catch {
    return false
  }
}

type CopyChipProps = {
  value: string
  label?: string
  toastLabel?: string
  className?: string
  children?: React.ReactNode
}

export function CopyChip({ value, label, toastLabel, className, children }: CopyChipProps) {
  const [copied, setCopied] = useState(false)
  const { toast } = useToast()
  const { chime } = useSound()
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = useCallback(
    async (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      const ok = await writeClipboard(value)
      if (!ok) {
        toast('copy blocked', 'select the text instead')
        return
      }
      setCopied(true)
      chime()
      toast(`${toastLabel ?? label ?? 'Copied'} copied`, 'paste anywhere')
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1800)
    },
    [value, label, toastLabel, toast, chime]
  )

  return (
    <button
      type="button"
      onClick={copy}
      data-sfx="hover"
      aria-label={`Copy ${label ?? value}`}
      className={cn(
        'cursor-target group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] transition-all duration-300',
        copied
          ? 'border-transparent text-black'
          : 'border-border text-muted-foreground hover:border-gold/50 hover:text-foreground',
        className
      )}
      style={
        copied
          ? {
              background: 'linear-gradient(100deg, rgb(244 214 160), rgb(226 183 106) 55%, rgb(214 152 132))',
              boxShadow: '0 6px 24px rgb(226 183 106 / 0.35)'
            }
          : undefined
      }
    >
      {children}
      <span className="relative flex h-3.5 w-3.5 items-center justify-center">
        <Copy
          className={cn(
            'absolute h-3.5 w-3.5 transition-all duration-300',
            copied ? 'scale-50 opacity-0' : 'scale-100 opacity-100'
          )}
        />
        <Check
          className={cn(
            'absolute h-3.5 w-3.5 transition-all duration-300',
            copied ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          )}
        />
      </span>
      <span>{copied ? 'copied' : (label ?? 'copy')}</span>
    </button>
  )
}
