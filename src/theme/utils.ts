/**
 * Theme Utility Functions
 * Non-component exports separated for Fast Refresh compatibility
 */

import type { Theme, ThemeBreakpoints } from '../types'
import { ThemeMode } from '../types'

// =============== THEME CONSTANTS ===============
export const lightTheme: Theme = {
  mode: ThemeMode.LIGHT,
  colors: {
    primary: '#007acc',
    secondary: '#6f42c1',
    accent: '#17a2b8',
    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#212529',
    textSecondary: '#6c757d',
    border: '#dee2e6',
    success: '#28a745',
    warning: '#ffc107',
    error: '#dc3545'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1200px'
  },
  borderRadius: '8px',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
}

export const darkTheme: Theme = {
  mode: ThemeMode.DARK,
  colors: {
    primary: '#0ea5e9',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    background: '#0f172a',
    surface: '#1e293b',
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    border: '#334155',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444'
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem'
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
    desktop: '1024px',
    wide: '1200px'
  },
  borderRadius: '8px',
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
}

// =============== THEME UTILITIES ===============
export const getThemeByMode = (mode: ThemeMode): Theme => {
  switch (mode) {
    case ThemeMode.LIGHT:
      return lightTheme
    case ThemeMode.DARK:
      return darkTheme
    case ThemeMode.SYSTEM: {
      // System preference detection
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      return prefersDark ? darkTheme : lightTheme
    }
    default:
      return lightTheme
  }
}

export const createCustomTheme = (baseTheme: Theme, overrides: Partial<Theme>): Theme => {
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

export const getContrastColor = (theme: Theme): string => {
  return theme.mode === ThemeMode.DARK ? theme.colors.text : theme.colors.background
}

export const generateThemeCSS = (theme: Theme): React.CSSProperties => {
  return {
    '--primary-color': theme.colors.primary,
    '--secondary-color': theme.colors.secondary,
    '--success-color': theme.colors.success,
    '--warning-color': theme.colors.warning,
    '--error-color': theme.colors.error,
    '--background-color': theme.colors.background,
    '--surface-color': theme.colors.surface,
    '--text-color': theme.colors.text,
    '--text-secondary-color': theme.colors.textSecondary,
    '--border-color': theme.colors.border,
    '--spacing-xs': theme.spacing.xs,
    '--spacing-sm': theme.spacing.sm,
    '--spacing-md': theme.spacing.md,
    '--spacing-lg': theme.spacing.lg,
    '--spacing-xl': theme.spacing.xl,
    '--spacing-xxl': theme.spacing.xxl,
    '--border-radius': theme.borderRadius,
    '--font-family': theme.fontFamily
  } as React.CSSProperties
}

export const getResponsiveStyles = (theme: Theme) => ({
  mobile: `@media (max-width: ${theme.breakpoints.mobile})`,
  tablet: `@media (min-width: ${theme.breakpoints.tablet}) and (max-width: ${theme.breakpoints.desktop})`,
  desktop: `@media (min-width: ${theme.breakpoints.desktop})`,
  wide: `@media (min-width: ${theme.breakpoints.wide})`
})

export const getElevationStyles = (theme: Theme, level: number = 1) => ({
  boxShadow: theme.mode === ThemeMode.DARK
    ? `0 ${level * 2}px ${level * 8}px rgba(0, 0, 0, 0.4)`
    : `0 ${level}px ${level * 4}px rgba(0, 0, 0, 0.1)`,
  zIndex: level
})

export const createThemeTransition = (properties: string[] = ['background-color', 'color', 'border-color']) => {
  return properties.map(prop => `${prop} 0.3s ease`).join(', ')
}

export const getThemeTransition = () => ({
  transition: createThemeTransition()
})

export const getMediaQuery = (breakpoint: keyof ThemeBreakpoints, theme: Theme): string => {
  return `@media (min-width: ${theme.breakpoints[breakpoint]})`
}

export const isDarkMode = (theme: Theme): boolean => {
  return theme.mode === ThemeMode.DARK
}

export const getThemeRadius = () => ({
  sm: '0.125rem',
  md: '0.375rem', 
  lg: '0.5rem',
  xl: '0.75rem',
  full: '9999px'
})

export const getThemeShadows = (theme: Theme) => {
  const shadowColor = theme.mode === ThemeMode.DARK ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)'
  return {
    sm: `0 1px 2px 0 ${shadowColor}`,
    md: `0 4px 6px -1px ${shadowColor}`,
    lg: `0 10px 15px -3px ${shadowColor}`,
    xl: `0 25px 50px -12px ${shadowColor}`,
    inner: `inset 0 2px 4px 0 ${shadowColor}`
  }
}