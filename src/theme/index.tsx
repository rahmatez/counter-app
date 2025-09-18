
/**
 * Advanced TypeScript Theme System Components
 * Only React components for Fast Refresh compatibility
 */

import React, { createContext, useContext, useMemo, useEffect } from 'react'
import type { Theme, ThemeContextValue } from '../types'
import { ThemeMode } from '../types'
import { useTheme as useThemeHook } from '../hooks'
import { generateThemeCSS, createCustomTheme } from './utils'

// =============== THEME CONTEXT ===============
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export interface ThemeProviderProps {
  children: React.ReactNode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const themeHook = useThemeHook()

  const contextValue = useMemo<ThemeContextValue>(() => ({
    theme: themeHook.theme,
    toggleTheme: themeHook.toggleTheme,
    setTheme: themeHook.setTheme
  }), [themeHook])

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

// =============== THEME CONSUMER HOOK ===============
export const useThemeContext = (): ThemeContextValue => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}

// =============== ENHANCED THEME PROVIDER ===============
export interface EnhancedThemeProviderProps {
  children: React.ReactNode
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

  const contextValue = useMemo<ThemeContextValue>(() => ({
    theme: enhancedTheme,
    toggleTheme: themeHook.toggleTheme,
    setTheme: themeHook.setTheme
  }), [enhancedTheme, themeHook])

  // Apply theme styles to document
  useEffect(() => {
    const styles = generateThemeCSS(enhancedTheme)
    const root = document.documentElement

    // Apply CSS custom properties
    Object.entries(styles).forEach(([property, value]) => {
      if (typeof value === 'string') {
        root.style.setProperty(property, value)
      }
    })

    // Apply body styles
    document.body.style.backgroundColor = enhancedTheme.colors.background
    document.body.style.color = enhancedTheme.colors.text
    document.body.style.fontFamily = enhancedTheme.fontFamily || 'Inter, sans-serif'
  }, [enhancedTheme])

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

// =============== STYLED COMPONENTS ===============
export interface StyledBoxProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  elevation?: number
}

export const StyledBox: React.FC<StyledBoxProps> = ({ 
  children, 
  className, 
  style, 
  elevation = 0 
}) => {
  const { theme } = useThemeContext()

  const boxStyles = useMemo(() => {
    const baseStyles: React.CSSProperties = {
      backgroundColor: theme.colors.surface,
      color: theme.colors.text,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: theme.borderRadius || '0.5rem',
      padding: theme.spacing.md,
      ...style
    }

    if (elevation > 0) {
      const shadowColor = theme.mode === ThemeMode.DARK ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.1)'
      baseStyles.boxShadow = `0 ${elevation * 2}px ${elevation * 8}px ${shadowColor}`
    }

    return baseStyles
  }, [theme, elevation, style])

  return (
    <div className={className} style={boxStyles}>
      {children}
    </div>
  )
}

export interface ThemeToggleButtonProps {
  className?: string
  style?: React.CSSProperties
}

export const ThemeToggleButton: React.FC<ThemeToggleButtonProps> = ({ 
  className, 
  style 
}) => {
  const { theme, toggleTheme } = useThemeContext()

  const buttonStyles = useMemo((): React.CSSProperties => ({
    backgroundColor: theme.colors.primary,
    color: theme.colors.background,
    border: 'none',
    borderRadius: theme.borderRadius || '0.5rem',
    padding: `${theme.spacing.sm} ${theme.spacing.md}`,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease',
    ...style
  }), [theme, style])

  return (
    <button 
      className={className}
      style={buttonStyles}
      onClick={toggleTheme}
      aria-label="Toggle theme"
    >
      {theme.mode === 'dark' ? '☀️' : '🌙'} Toggle Theme
    </button>
  )
}

// Export default theme provider
export default EnhancedThemeProvider