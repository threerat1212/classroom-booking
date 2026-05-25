import { cn } from '@/lib/utils'

interface StudentCharacterAvatarProps {
  name?: string
  className?: string
  compact?: boolean
}

export function StudentCharacterAvatar({ name, className, compact = false }: StudentCharacterAvatarProps) {
  return (
    <div
      className={cn(
        'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-sky-100 via-rose-50 to-amber-50 shadow-sm',
        className,
      )}
      aria-label={name ? `${name} avatar` : 'Student avatar'}
      role="img"
    >
      <svg viewBox="0 0 120 120" className="h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="student-avatar-bg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#BAE6FD" />
            <stop offset="100%" stopColor="#FDE68A" />
          </linearGradient>
          <linearGradient id="student-avatar-shirt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E0F2FE" />
          </linearGradient>
          <linearGradient id="student-avatar-hair" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6B3F2A" />
            <stop offset="100%" stopColor="#2F1B14" />
          </linearGradient>
          <radialGradient id="student-avatar-face" cx="50%" cy="42%" r="55%">
            <stop offset="0%" stopColor="#FFE4CF" />
            <stop offset="100%" stopColor="#FFC9AC" />
          </radialGradient>
        </defs>
        <rect width="120" height="120" fill="url(#student-avatar-bg)" />
        <circle cx="27" cy="24" r="12" fill="#FEF3C7" opacity="0.96" />
        <path d="M0 88 C22 74 37 83 54 73 C78 58 96 68 120 52 L120 120 L0 120 Z" fill="#BFDBFE" opacity="0.72" />
        <path d="M9 84 C30 73 42 83 58 74 C78 63 94 66 113 56" fill="none" stroke="#93C5FD" strokeWidth="3" strokeLinecap="round" opacity="0.65" />
        <g transform={compact ? 'translate(0 5)' : 'translate(0 0)'}>
          <path d="M29 57 C29 33 43 17 61 17 C80 17 92 33 92 57 C92 78 79 90 60 90 C42 90 29 78 29 57 Z" fill="url(#student-avatar-hair)" />
          <path d="M31 57 C34 40 40 28 54 23 C50 36 42 44 31 57 Z" fill="#25140F" opacity="0.85" />
          <path d="M36 51 C36 35 47 25 61 25 C75 25 84 36 84 51 L84 60 C84 76 74 85 60 85 C46 85 36 76 36 60 Z" fill="url(#student-avatar-face)" />
          <path d="M35 50 C43 42 48 30 62 28 C75 29 81 38 86 51 C82 31 74 21 61 20 C47 19 37 30 35 50 Z" fill="#2A1710" />
          <path d="M42 34 C48 27 59 25 69 28" fill="none" stroke="#8B5A3C" strokeWidth="4" strokeLinecap="round" opacity="0.55" />
          <ellipse cx="49" cy="57" rx="5.2" ry="6.1" fill="#172033" />
          <ellipse cx="72" cy="57" rx="5.2" ry="6.1" fill="#172033" />
          <circle cx="51" cy="54" r="1.8" fill="#FFFFFF" />
          <circle cx="74" cy="54" r="1.8" fill="#FFFFFF" />
          <path d="M43 49 C47 47 51 47 54 50 M67 50 C70 47 75 47 78 49" fill="none" stroke="#5B3324" strokeWidth="2.6" strokeLinecap="round" />
          <circle cx="44" cy="66" r="6" fill="#FB7185" opacity="0.38" />
          <circle cx="77" cy="66" r="6" fill="#FB7185" opacity="0.38" />
          <path d="M53 70 C58 76 64 76 69 70" fill="none" stroke="#8B3A2D" strokeWidth="3" strokeLinecap="round" />
          <path d="M28 104 C34 88 45 82 60 82 C75 82 86 88 92 104 L28 104 Z" fill="url(#student-avatar-shirt)" />
          <path d="M48 85 L60 98 L72 85" fill="none" stroke="#2563EB" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M56 96 L61 108 L66 96 Z" fill="#2563EB" />
          <path d="M43 86 L34 104 M77 86 L86 104" stroke="#93C5FD" strokeWidth="4" strokeLinecap="round" />
          <g transform="translate(83 67)">
            <ellipse cx="8" cy="7" rx="6" ry="4.5" fill="#F59E0B" />
            <path d="M3 7 H13" stroke="#7C2D12" strokeWidth="1.6" />
            <circle cx="15" cy="6" r="2" fill="#111827" />
            <path d="M7 2 C4 -2 12 -2 9 3" fill="#FDE68A" opacity="0.88" />
          </g>
        </g>
      </svg>
    </div>
  )
}
