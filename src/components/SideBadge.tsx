/** Fixed vertical "Nominee" tab on the right edge (Awwwards-style). */
export default function SideBadge() {
  return (
    <a
      href="https://github.com/ssambit635-svg/portfolio.site"
      target="_blank"
      rel="noreferrer"
      className="fixed top-[38%] right-0 z-[70] flex w-[52px] flex-col items-center bg-ink py-4 text-cream max-md:hidden"
    >
      <span className="font-display text-[22px] font-semibold">S.</span>
      <span className="vertical-rl mt-6 font-label text-[10px] font-semibold tracking-[0.15em]">Portfolio</span>
    </a>
  )
}
