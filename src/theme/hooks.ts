/**
 * Theme Hooks
 * Separated for Fast Refresh compatibility  
 */

import React, { useContext } from 'react'
import type { ThemeContextValue } from '../types'

// Theme context will be imported from index file
let ThemeContext: React.Context<ThemeContextValue | undefined>

export const useThemeContext = (): ThemeContextValue => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider')
  }
  return context
}

// Function to set context reference (called from main theme file)
export const setThemeContext = (ctx: React.Context<ThemeContextValue | undefined>) => {
  ThemeContext = ctx
}