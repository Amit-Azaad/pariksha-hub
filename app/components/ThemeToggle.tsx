import { useTheme } from '../hooks/useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTheme();
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      onKeyDown={handleKeyDown}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={`relative inline-flex items-center h-8 w-14 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-interactive-focus)] ${
        isDark
          ? 'bg-[var(--color-accent-primary)] ring-1 ring-black/10'
          : 'bg-[var(--color-interactive-active)] ring-1 ring-black/5'
      } hover:brightness-105 active:scale-[0.98]`}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      {/* Sun icon (left) */}
      <span
        className={`absolute left-1.5 inline-flex items-center justify-center transition-opacity ${
          isDark ? 'opacity-50' : 'opacity-100'
        }`}
        aria-hidden="true"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-yellow-400">
          <circle cx="12" cy="12" r="3" />
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
      </span>
      {/* Moon icon (right) */}
      <span
        className={`absolute right-1.5 inline-flex items-center justify-center transition-opacity ${
          isDark ? 'opacity-100' : 'opacity-50'
        }`}
        aria-hidden="true"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-100">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>

      {/* Thumb */}
      <span
        className={`inline-block h-7 w-7 transform rounded-full bg-white shadow-md transition-transform ${
          isDark ? 'translate-x-6' : 'translate-x-1'
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
