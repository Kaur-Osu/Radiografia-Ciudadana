export function CivicMark({ className = '' }: { className?: string }) {
  return <svg className={className} viewBox="0 0 48 48" fill="none" aria-hidden="true">
    <rect x="2" y="2" width="44" height="44" rx="12" fill="currentColor" />
    <path d="M13 31h22M16 27V20M24 27V14M32 27V10" stroke="white" strokeWidth="3.4" strokeLinecap="round" />
    <path d="m17 36 5 4 10-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}
