import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

/**
 * A single-line glass toast used for tiny confirmations ("email copied").
 * Deliberately small: one toast at a time, auto-dismissing, and announced
 * politely to screen readers.
 */

type Toast = { id: number; message: string; hint?: string }

type ToastContextValue = { toast: (message: string, hint?: string) => void }

const ToastContext = createContext<ToastContextValue>({ toast: () => {} })

export function ToastProvider({ children }: { children: ReactNode }) {
  const [current, setCurrent] = useState<Toast | null>(null)
  const timer = useRef(0)
  const idRef = useRef(0)

  const toast = useCallback((message: string, hint?: string) => {
    window.clearTimeout(timer.current)
    idRef.current += 1
    setCurrent({ id: idRef.current, message, hint })
    timer.current = window.setTimeout(() => setCurrent(null), 2400)
  }, [])

  const value = useMemo(() => ({ toast }), [toast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed bottom-8 left-1/2 z-[997] -translate-x-1/2 px-4"
        role="status"
        aria-live="polite"
      >
        <div
          key={current?.id ?? 'empty'}
          className={`flex items-center gap-3 whitespace-nowrap rounded-full border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] backdrop-blur-md transition-all duration-500 ${
            current
              ? 'translate-y-0 border-gold/40 bg-black/70 text-white opacity-100 shadow-[0_10px_40px_rgb(226_183_106_/_0.18)]'
              : 'pointer-events-none translate-y-3 opacity-0'
          }`}
          style={{
            borderColor: current ? 'rgb(226 183 106 / 0.4)' : 'transparent',
            background: current ? 'rgb(10 11 18 / 0.78)' : 'transparent'
          }}
        >
          {current && (
            <>
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: 'rgb(226 183 106)', boxShadow: '0 0 10px rgb(226 183 106)' }}
              />
              <span>{current.message}</span>
              {current.hint && <span className="text-white/45">{current.hint}</span>}
            </>
          )}
        </div>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
