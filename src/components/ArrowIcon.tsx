type ArrowIconProps = {
  /** Which way the arrow points. `left` is the back arrow. */
  dir?: 'up-right' | 'left'
  className?: string
}

/**
 * A drawn arrow.
 *
 * The mono and sans faces this site ships have no U+2197 in them, so every
 * text arrow turned into a tofu box on some machines — in the project links,
 * on the certificate rows and on the CV. A 10-unit path with a square cap
 * matches the rest of the linework, inherits the link colour, and cannot fall
 * back to a missing glyph. Sizing is inline so the icon also works on the CV
 * and dashboard pages, which do not load the main stylesheet.
 */
export default function ArrowIcon({ dir = 'up-right', className }: ArrowIconProps) {
  return (
    <svg
      className={className ? `arrow-icon ${className}` : 'arrow-icon'}
      viewBox="0 0 10 10"
      aria-hidden="true"
      focusable="false"
      style={{
        display: 'inline-block',
        width: '0.72em',
        height: '0.72em',
        flex: 'none',
        verticalAlign: '-0.02em',
        marginLeft: dir === 'left' ? 0 : '0.35em',
        marginRight: dir === 'left' ? '0.4em' : 0,
      }}
    >
      <path
        d={dir === 'left' ? 'M8.5 5H1.5M4.7 2 1.5 5l3.2 3' : 'M2.4 8.6 8.6 2.4M3.6 2.4h5v5'}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
    </svg>
  )
}
