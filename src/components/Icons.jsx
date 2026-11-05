const s = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' }
export const IconBag = (p) => (
  <svg viewBox="0 0 20 20" width="18" height="18" {...s} {...p} aria-hidden="true">
    <path d="M4 6.5h12l-1 10.5H5L4 6.5Z" />
    <path d="M7.2 8.5V5.6a2.8 2.8 0 0 1 5.6 0v2.9" />
  </svg>
)
export const IconClose = (p) => (
  <svg viewBox="0 0 16 16" {...s} {...p} aria-hidden="true">
    <path d="M3 3l10 10M13 3L3 13" />
  </svg>
)
export const IconPlus = (p) => (
  <svg viewBox="0 0 16 16" {...s} {...p} aria-hidden="true">
    <path d="M8 2v12M2 8h12" />
  </svg>
)
export const IconMinus = (p) => (
  <svg viewBox="0 0 16 16" {...s} {...p} aria-hidden="true">
    <path d="M2 8h12" />
  </svg>
)
export const IconRotate = (p) => (
  <svg viewBox="0 0 20 20" width="14" height="14" {...s} {...p} aria-hidden="true">
    <path d="M3.5 10a6.5 6.5 0 0 1 11.3-4.4M16.5 10a6.5 6.5 0 0 1-11.3 4.4" />
    <path d="M15.2 2.6v3.2H12M4.8 17.4v-3.2H8" />
  </svg>
)
export const IconShield = (p) => (
  <svg viewBox="0 0 20 20" {...s} {...p} aria-hidden="true">
    <path d="M10 2.5 16 5v4.6c0 3.7-2.6 6.6-6 7.9-3.4-1.3-6-4.2-6-7.9V5l6-2.5Z" />
    <path d="m7.4 10 1.8 1.8 3.5-3.6" />
  </svg>
)
export const IconTruck = (p) => (
  <svg viewBox="0 0 20 20" {...s} {...p} aria-hidden="true">
    <path d="M2.5 5.5h9v8h-9zM11.5 8.5h3.2l2.8 2.8v2.2h-6" />
    <circle cx="6" cy="14.6" r="1.4" />
    <circle cx="14.6" cy="14.6" r="1.4" />
  </svg>
)
export const IconBox = (p) => (
  <svg viewBox="0 0 20 20" {...s} {...p} aria-hidden="true">
    <path d="M3 6.5 10 3l7 3.5v7L10 17l-7-3.5v-7Z" />
    <path d="M3 6.5 10 10l7-3.5M10 10v7" />
  </svg>
)
