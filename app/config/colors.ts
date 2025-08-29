// Color Palette System using 60:30:10 Color Theory
// 60% - Dominant/Background colors
// 30% - Secondary/Accent colors  
// 10% - Accent/Highlight colors

export const lightModeColors = {
  // 60% - Dominant/Background colors
  primary: {
    background: '#ffffff',           // Main background
    surface: '#f8fafc',             // Card/section backgrounds
    border: '#e2e8f0',             // Subtle borders
    muted: '#f1f5f9',              // Muted backgrounds
  },
  
  // 30% - Secondary/Accent colors
  secondary: {
    background: '#d8e4ff',          // Top bar & bottom nav (your chosen color)
    surface: '#e0e7ff',             // Secondary surfaces
    border: '#c7d2fe',              // Secondary borders
    text: '#475569',                // Secondary text
  },
  
  // 10% - Accent/Highlight colors
  accent: {
    primary: '#3b82f6',             // Primary blue
    secondary: '#6366f1',           // Secondary blue
    success: '#10b981',             // Success green
    warning: '#f59e0b',             // Warning yellow
    error: '#ef4444',               // Error red
  },
  
  // Text colors
  text: {
    primary: '#1e293b',             // Main text
    secondary: '#64748b',           // Secondary text
    muted: '#94a3b8',               // Muted text
    inverse: '#ffffff',             // Text on dark backgrounds
  },
  
  // Interactive elements
  interactive: {
    hover: '#f1f5f9',               // Hover states
    active: '#e2e8f0',              // Active states
    focus: '#3b82f6',               // Focus ring
    disabled: '#cbd5e1',            // Disabled state
  }
};

export const darkModeColors = {
  // 60% - Dominant/Background colors
  primary: {
    background: '#0f172a',          // Main background
    surface: '#1e293b',             // Card/section backgrounds
    border: '#334155',              // Subtle borders
    muted: '#1e293b',              // Muted backgrounds
  },
  
  // 30% - Secondary/Accent colors
  secondary: {
    background: '#0f172a',          // Darker version of your color
    surface: '#1e40af',             // Secondary surfaces
    border: '#3b82f6',              // Secondary borders
    text: '#cbd5e1',                // Secondary text
  },
  
  // 10% - Accent/Highlight colors
  accent: {
    primary: '#60a5fa',             // Brighter blue for dark mode
    secondary: '#818cf8',           // Brighter secondary blue
    success: '#34d399',             // Brighter success green
    warning: '#fbbf24',             // Brighter warning yellow
    error: '#f87171',               // Brighter error red
  },
  
  // Text colors
  text: {
    primary: '#f8fafc',             // Main text
    secondary: '#cbd5e1',           // Secondary text
    muted: '#94a3b8',               // Muted text
    inverse: '#0f172a',             // Text on light backgrounds
  },
  
  // Interactive elements
  interactive: {
    hover: '#334155',               // Hover states
    active: '#475569',              // Active states
    focus: '#60a5fa',               // Focus ring
    disabled: '#475569',            // Disabled state
  }
};

// Semantic color mappings
export const semanticColors = {
  light: {
    header: lightModeColors.secondary.background,
    bottomNav: lightModeColors.secondary.background,
    card: lightModeColors.primary.surface,
    button: lightModeColors.accent.primary,
    buttonHover: lightModeColors.accent.secondary,
    text: lightModeColors.text.primary,
    textSecondary: lightModeColors.text.secondary,
    border: lightModeColors.primary.border,
    success: lightModeColors.accent.success,
    warning: lightModeColors.accent.warning,
    error: lightModeColors.accent.error,
  },
  dark: {
    header: darkModeColors.secondary.background,
    bottomNav: darkModeColors.secondary.background,
    card: darkModeColors.primary.surface,
    button: darkModeColors.accent.primary,
    buttonHover: darkModeColors.accent.secondary,
    text: darkModeColors.text.primary,
    textSecondary: darkModeColors.text.secondary,
    border: darkModeColors.primary.border,
    success: darkModeColors.accent.success,
    warning: darkModeColors.accent.warning,
    error: darkModeColors.accent.error,
  }
};

// CSS Custom Properties for easy usage
export const generateCSSVariables = (isDark: boolean) => {
  const colors = isDark ? darkModeColors : lightModeColors;
  const semantic = isDark ? semanticColors.dark : semanticColors.light;
  
  return {
    '--color-bg-primary': colors.primary.background,
    '--color-bg-secondary': colors.secondary.background,
    '--color-bg-surface': colors.primary.surface,
    '--color-bg-muted': colors.primary.muted,
    '--color-border': colors.primary.border,
    '--color-border-secondary': colors.secondary.border,
    '--color-text-primary': colors.text.primary,
    '--color-text-secondary': colors.text.secondary,
    '--color-text-muted': colors.text.muted,
    '--color-text-inverse': colors.text.inverse,
    '--color-accent-primary': colors.accent.primary,
    '--color-accent-secondary': colors.accent.secondary,
    '--color-accent-success': colors.accent.success,
    '--color-accent-warning': colors.accent.warning,
    '--color-accent-error': colors.accent.error,
    '--color-interactive-hover': colors.interactive.hover,
    '--color-interactive-active': colors.interactive.active,
    '--color-interactive-focus': colors.interactive.focus,
    '--color-interactive-disabled': colors.interactive.disabled,
    // Semantic colors
    '--color-header': semantic.header,
    '--color-bottom-nav': semantic.bottomNav,
    '--color-card': semantic.card,
    '--color-button': semantic.button,
    '--color-button-hover': semantic.buttonHover,
    '--color-text': semantic.text,
    '--color-text-secondary': semantic.textSecondary,
    '--color-border': semantic.border,
    '--color-success': semantic.success,
    '--color-warning': semantic.warning,
    '--color-error': semantic.error,
  };
};

// Tailwind CSS color classes mapping
export const tailwindColorMap = {
  light: {
    'bg-primary': 'bg-white',
    'bg-secondary': 'bg-[#d8e4ff]',
    'bg-surface': 'bg-slate-50',
    'bg-muted': 'bg-slate-100',
    'text-primary': 'text-slate-800',
    'text-secondary': 'text-slate-600',
    'text-muted': 'text-slate-400',
    'border-primary': 'border-slate-200',
    'border-secondary': 'border-indigo-200',
    'accent-primary': 'bg-blue-500',
    'accent-secondary': 'bg-indigo-500',
  },
  dark: {
    'bg-primary': 'bg-slate-900',
    'bg-secondary': 'bg-blue-900',
    'bg-surface': 'bg-slate-800',
    'bg-muted': 'bg-slate-800',
    'text-primary': 'text-slate-100',
    'text-secondary': 'text-slate-300',
    'text-muted': 'text-slate-400',
    'border-primary': 'border-slate-700',
    'border-secondary': 'border-blue-600',
    'accent-primary': 'bg-blue-400',
    'accent-secondary': 'bg-indigo-400',
  }
};

export default {
  lightModeColors,
  darkModeColors,
  semanticColors,
  generateCSSVariables,
  tailwindColorMap
};
