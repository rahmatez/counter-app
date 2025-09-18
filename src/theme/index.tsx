/**
 * Advanced TypeScript Theme System with Light/Dark Mode
 * Comprehensive theming solution with CSS-in-JS and type safety
 */

import React, { createContext, useContext, useMemo } from 'react'
import type {
  Theme,
  ThemeColors,
  ThemeSpacing,
  ThemeBreakpoints,
  ThemeContextValue
} from '../types'
import { ThemeMode } from '../types'
import { useTheme as useThemeHook } from '../hooks'

// =============== THEME CONSTANTS ===============
export const THEME_STORAGE_KEY = 'counter-app-theme'

// Light theme colors
const lightColors: ThemeColors = {
  primary: '#2563eb',
  secondary: '#475569',
  accent: '#d97706',
  background: '#ffffff',
  surface: '#f8fafc',
  text: '#0f172a',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  success: '#059669',
  warning: '#d97706',
  error: '#dc2626'
}

// Dark theme colors
const darkColors: ThemeColors = {
  primary: '#3b82f6',
  secondary: '#64748b',
  accent: '#f59e0b',
  background: '#0f172a',
  surface: '#1e293b',
  text: '#f1f5f9',
  textSecondary: '#94a3b8',
  border: '#334155',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444'
}

// Shared spacing values
const spacing: ThemeSpacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem'
}

// Responsive breakpoints
const breakpoints: ThemeBreakpoints = {
  mobile: '480px',
  tablet: '768px',
  desktop: '1024px',
  wide: '1280px'
}

// =============== THEME VARIANTS ===============
export const lightTheme: Theme = {
  mode: ThemeMode.LIGHT,
  colors: lightColors,
  spacing,
  breakpoints,
  borderRadius: '0.5rem',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
}

export const darkTheme: Theme = {
  mode: ThemeMode.DARK,
  colors: darkColors,
  spacing,
  breakpoints,
  borderRadius: '0.5rem',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
}

// =============== THEME UTILITIES ===============
export const getThemeByMode = (mode: ThemeMode): Theme => {
  switch (mode) {
    case ThemeMode.LIGHT:
      return lightTheme
    case ThemeMode.DARK:
      return darkTheme
    case ThemeMode.SYSTEM:
      // System preference detection
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark ? darkTheme : lightTheme
    default:
      return lightTheme
  }
}

export const createCustomTheme = (
  baseTheme: Theme,
  overrides: Partial<Theme>
): Theme => {
  return {
    ...baseTheme,
    ...overrides,
    colors: {
      ...baseTheme.colors,
      ...overrides.colors
    },
    spacing: {
      ...baseTheme.spacing,
      ...overrides.spacing
    },
    breakpoints: {
      ...baseTheme.breakpoints,
      ...overrides.breakpoints
    }
  }
}

// =============== CSS-IN-JS UTILITIES ===============
export const createThemeStyles = (theme: Theme) => ({
  // CSS Custom Properties
  ':root': {
    '--color-primary': theme.colors.primary,
    '--color-secondary': theme.colors.secondary,
    '--color-accent': theme.colors.accent,
    '--color-background': theme.colors.background,
    '--color-surface': theme.colors.surface,
    '--color-text': theme.colors.text,
    '--color-text-secondary': theme.colors.textSecondary,
    '--color-border': theme.colors.border,
    '--color-success': theme.colors.success,
    '--color-warning': theme.colors.warning,
    '--color-error': theme.colors.error,
    '--spacing-xs': theme.spacing.xs,
    '--spacing-sm': theme.spacing.sm,
    '--spacing-md': theme.spacing.md,
    '--spacing-lg': theme.spacing.lg,
    '--spacing-xl': theme.spacing.xl,
    '--spacing-xxl': theme.spacing.xxl,
    '--border-radius': theme.borderRadius,
    '--font-family': theme.fontFamily,
    '--breakpoint-mobile': theme.breakpoints.mobile,
    '--breakpoint-tablet': theme.breakpoints.tablet,
    '--breakpoint-desktop': theme.breakpoints.desktop,
    '--breakpoint-wide': theme.breakpoints.wide
  },

  // Theme-aware styles
  body: {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontFamily: theme.fontFamily,
    transition: 'background-color 0.3s ease, color 0.3s ease'
  }
})

// =============== THEME STYLED COMPONENTS ===============
interface ThemedComponentProps {
  theme: Theme
  children: React.ReactNode
  className?: string
}

export const ThemedContainer: React.FC<ThemedComponentProps> = ({ 
  theme, 
  children, 
  className 
}) => {
  const style: React.CSSProperties = {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    fontFamily: theme.fontFamily,
    minHeight: '100vh',
    transition: 'all 0.3s ease'
  }

  return (
    <div className={`themed-container ${className || ''}`} style={style}>
      {children}
    </div>
  )
}

export const ThemedCard: React.FC<ThemedComponentProps> = ({ 
  theme, 
  children, 
  className 
}) => {
  const style: React.CSSProperties = {
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    borderRadius: theme.borderRadius,
    padding: theme.spacing.lg,
    boxShadow: theme.mode === ThemeMode.DARK 
      ? '0 4px 6px rgba(0, 0, 0, 0.3)' 
      : '0 4px 6px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease'
  }

  return (
    <div className={`themed-card ${className || ''}`} style={style}>
      {children}
    </div>
  )
}

export const ThemedButton: React.FC<ThemedComponentProps & {
  variant?: 'primary' | 'secondary' | 'accent' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
}> = ({ 
  theme, 
  children, 
  className, 
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    const variants = {
      primary: {
        backgroundColor: theme.colors.primary,
        color: '#ffffff',
        borderColor: theme.colors.primary
      },
      secondary: {
        backgroundColor: 'transparent',
        color: theme.colors.text,
        borderColor: theme.colors.border
      },
      accent: {
        backgroundColor: theme.colors.accent,
        color: '#ffffff',
        borderColor: theme.colors.accent
      },
      danger: {
        backgroundColor: theme.colors.error,
        color: '#ffffff',
        borderColor: theme.colors.error
      }
    }
    return variants[variant]
  }

  const getSizeStyles = (): React.CSSProperties => {
    const sizes = {
      sm: {
        padding: `${theme.spacing.sm} ${theme.spacing.md}`,
        fontSize: '0.875rem'
      },
      md: {
        padding: `${theme.spacing.md} ${theme.spacing.lg}`,
        fontSize: '1rem'
      },
      lg: {
        padding: `${theme.spacing.lg} ${theme.spacing.xl}`,
        fontSize: '1.125rem'
      }
    }
    return sizes[size]
  }

  const style: React.CSSProperties = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    border: '1px solid',
    borderRadius: theme.borderRadius,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: 'all 0.2s ease',
    fontFamily: theme.fontFamily,
    fontWeight: '500'
  }

  return (
    <button
      className={`themed-button ${className || ''}`}
      style={style}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

// =============== THEME TOGGLE COMPONENT ===============
interface ThemeToggleProps {
  theme: Theme
  onToggle: () => void
  size?: number
  className?: string
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  theme, 
  onToggle, 
  size = 24, 
  className 
}) => {
  const isDark = theme.mode === ThemeMode.DARK

  const style: React.CSSProperties = {
    backgroundColor: 'transparent',
    border: `2px solid ${theme.colors.border}`,
    borderRadius: '50%',
    width: size * 2,
    height: size * 2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    color: theme.colors.text
  }

  return (
    <button
      className={`theme-toggle ${className || ''}`}
      style={style}
      onClick={onToggle}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
    >
      <span style={{ fontSize: size }}>
        {isDark ? '☀️' : '🌙'}
      </span>
    </button>
  )
}

// =============== RESPONSIVE UTILITIES ===============
export const createMediaQuery = (breakpoint: keyof ThemeBreakpoints) => {
  return (theme: Theme) => `@media (min-width: ${theme.breakpoints[breakpoint]})`
}

export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = React.useState<boolean>(false)

  React.useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    setMatches(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [query])

  return matches
}

export const useBreakpoint = (breakpoint: keyof ThemeBreakpoints) => {
  const { theme } = useThemeHook()
  const query = `(min-width: ${theme.breakpoints[breakpoint]})`
  return useMediaQuery(query)
}

// =============== THEME ANIMATION UTILITIES ===============
export const createThemeTransition = (properties: string[] = ['background-color', 'color', 'border-color']) => {
  return properties.map(prop => `${prop} 0.3s ease`).join(', ')
}

export const getThemeTransition = () => ({
  transition: createThemeTransition()
})

// =============== ENHANCED THEME CONTEXT ===============
const EnhancedThemeContext = createContext<ThemeContextValue & {
  createCustomTheme: (overrides: Partial<Theme>) => Theme
  applyThemeStyles: () => React.CSSProperties
  getMediaQuery: (breakpoint: keyof ThemeBreakpoints) => string
} | undefined>(undefined)

export interface EnhancedThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeMode
  customThemeOverrides?: Partial<Theme>
}

export const EnhancedThemeProvider: React.FC<EnhancedThemeProviderProps> = ({
  children,
  customThemeOverrides
}) => {
  const themeHook = useThemeHook()

  const enhancedTheme = useMemo(() => {
    if (customThemeOverrides) {
      return createCustomTheme(themeHook.theme, customThemeOverrides)
    }
    return themeHook.theme
  }, [themeHook.theme, customThemeOverrides])

  const contextValue = useMemo(() => ({
    theme: enhancedTheme,
    toggleTheme: themeHook.toggleTheme,
    setTheme: themeHook.setTheme,
    createCustomTheme: (overrides: Partial<Theme>) => createCustomTheme(enhancedTheme, overrides),
    applyThemeStyles: () => createThemeStyles(enhancedTheme)[':root'] as React.CSSProperties,
    getMediaQuery: (breakpoint: keyof ThemeBreakpoints) => 
      `(min-width: ${enhancedTheme.breakpoints[breakpoint]})`
  }), [enhancedTheme, themeHook])

  // Apply theme styles to document
  React.useEffect(() => {
    const styles = createThemeStyles(enhancedTheme)
    const root = document.documentElement

    // Apply CSS custom properties
    Object.entries(styles[':root']).forEach(([property, value]) => {
      root.style.setProperty(property, value as string)
    })

    // Apply body styles
    Object.entries(styles.body).forEach(([property, value]) => {
      (document.body.style as any)[property] = value
    })
  }, [enhancedTheme])

  return (
    <EnhancedThemeContext.Provider value={contextValue}>
      {children}
    </EnhancedThemeContext.Provider>
  )
}

export const useEnhancedTheme = () => {
  const context = useContext(EnhancedThemeContext)
  if (context === undefined) {
    throw new Error('useEnhancedTheme must be used within an EnhancedThemeProvider')
  }
  return context
}

// =============== THEME PRESET SYSTEM ===============
export interface ThemePreset {
  name: string
  displayName: string
  theme: Theme
  preview: {
    primary: string
    background: string
    surface: string
  }
}

export const themePresets: ThemePreset[] = [
  {
    name: 'default-light',
    displayName: 'Default Light',
    theme: lightTheme,
    preview: {
      primary: lightTheme.colors.primary,
      background: lightTheme.colors.background,
      surface: lightTheme.colors.surface
    }
  },
  {
    name: 'default-dark',
    displayName: 'Default Dark',
    theme: darkTheme,
    preview: {
      primary: darkTheme.colors.primary,
      background: darkTheme.colors.background,
      surface: darkTheme.colors.surface
    }
  },
  {
    name: 'ocean',
    displayName: 'Ocean Blue',
    theme: createCustomTheme(lightTheme, {
      colors: {
        ...lightTheme.colors,
        primary: '#0ea5e9',
        accent: '#06b6d4',
        surface: '#f0f9ff'
      }
    }),
    preview: {
      primary: '#0ea5e9',
      background: '#ffffff',
      surface: '#f0f9ff'
    }
  },
  {
    name: 'forest',
    displayName: 'Forest Green',
    theme: createCustomTheme(lightTheme, {
      colors: {
        ...lightTheme.colors,
        primary: '#059669',
        accent: '#10b981',
        surface: '#f0fdf4'
      }
    }),
    preview: {
      primary: '#059669',
      background: '#ffffff',
      surface: '#f0fdf4'
    }
  },
  {
    name: 'sunset',
    displayName: 'Sunset Orange',
    theme: createCustomTheme(lightTheme, {
      colors: {
        ...lightTheme.colors,
        primary: '#ea580c',
        accent: '#f97316',
        surface: '#fff7ed'
      }
    }),
    preview: {
      primary: '#ea580c',
      background: '#ffffff',
      surface: '#fff7ed'
    }
  }
]

export const getThemePreset = (name: string): ThemePreset | undefined => {
  return themePresets.find(preset => preset.name === name)
}