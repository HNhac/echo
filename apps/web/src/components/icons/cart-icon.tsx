export function CartIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M3.2 4.2h1.55l.48 2.15" />
      <path d="M5.23 6.35h13.12a1.15 1.15 0 0 1 1.12 1.45l-1.28 4.62a1.85 1.85 0 0 1-1.78 1.33H8.12a1.85 1.85 0 0 1-1.8-1.42L5.23 6.35Z" />
      <path d="M8.35 16.85h8.9" />
      <circle cx="9.1" cy="19.15" r="1.15" />
      <circle cx="16.9" cy="19.15" r="1.15" />
    </svg>
  );
}
