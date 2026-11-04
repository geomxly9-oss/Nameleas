export function Mark({ className = 'logo__mark', title }) {
  return (
    <svg className={className} viewBox="0 0 40 40" fill="none" aria-hidden={title ? undefined : true} role={title ? 'img' : undefined}>
      {title && <title>{title}</title>}
      <circle cx="20" cy="20" r="18.25" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="14.5" stroke="currentColor" strokeWidth="0.6" opacity="0.55" />
      <path d="M20 22.6 L9.4 13.2 M20 22.6 L30.6 13.2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="20" cy="22.6" r="1.9" fill="currentColor" />
      <path d="M38.4 18.2v3.6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  )
}

export default function Logo({ onClick, href = '#/' }) {
  return (
    <a className="logo" href={href} onClick={onClick} aria-label="Velora Time, home">
      <Mark />
      <span className="logo__word" aria-hidden="true">
        <span className="logo__name">VELORA</span>
        <span className="logo__sub">TIME</span>
      </span>
    </a>
  )
}
