import { Component, type ErrorInfo, type ReactNode } from 'react'
import { profile } from '../../lib/site'

/**
 * Last line of defence. If anything unexpected throws during render, the page
 * still shows something readable — a portfolio should never be a white screen.
 */
export class AppBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Portfolio render error:', error, info)
  }

  render() {
    if (!this.state.failed) return this.props.children

    return (
      <div className="min-h-[100svh] bg-cream-100 px-6 py-20">
        <div className="mx-auto max-w-[46rem]">
          <p className="label-mono text-ink-400">Static mode</p>
          <h1 className="mt-4 text-[clamp(2rem,6vw,3.4rem)] font-medium leading-[1] tracking-[-0.045em] text-ink-900">
            Something in the animation layer stopped cooperating.
          </h1>
          <p className="mt-5 text-[1rem] leading-relaxed text-ink-500">
            The interactive build hit an error, but the important part still works: I am Sambit Swain, a software
            developer and interface designer from Berhampur, Odisha. Reload to try the full experience again, or reach
            me directly.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-ink-900 px-6 py-3 text-[0.9rem] font-medium text-cream-100"
            >
              Reload the site
            </button>
            <a
              href={`mailto:${profile.email}`}
              className="rounded-full border border-ink-900/20 px-6 py-3 text-[0.9rem] font-medium text-ink-900"
            >
              {profile.email}
            </a>
          </div>
          <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 border-t border-ink-900/10 pt-6">
            {[
              { label: 'GitHub', href: profile.github },
              { label: 'LinkedIn', href: profile.linkedin },
              { label: 'X', href: profile.x }
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noreferrer noopener"
                className="label-mono text-ink-500 transition-colors duration-300 hover:text-ember-600"
              >
                {item.label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    )
  }
}
