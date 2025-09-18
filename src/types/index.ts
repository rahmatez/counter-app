/**
 * Core Types and Interfaces for Counter App
 * Comprehensive TypeScript definitions for type safety
 */

// =============== CONST ASSERTIONS (instead of enums) ===============
export const ThemeMode = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const

export type ThemeMode = typeof ThemeMode[keyof typeof ThemeMode]

export const CounterActionType = {
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
  RESET: 'RESET',
  SET_VALUE: 'SET_VALUE'
} as const

export type CounterActionType = typeof CounterActionType[keyof typeof CounterActionType]

export const NotificationType = {
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info'
} as const

export type NotificationType = typeof NotificationType[keyof typeof NotificationType]

// =============== BASE INTERFACES ===============
export interface BaseComponent {
  id: string
  className?: string
  'data-testid'?: string
}

export interface Identifiable {
  id: string | number
}

export interface Timestamped {
  createdAt: Date
  updatedAt: Date
}

// =============== COUNTER TYPES ===============
export interface CounterState {
  value: number
  isLoading: boolean
  error: string | null
  history: CounterHistoryEntry[]
}

export interface CounterHistoryEntry extends Timestamped {
  id: string
  action: CounterActionType
  previousValue: number
  newValue: number
  timestamp: Date
}

export interface CounterConfig {
  initialValue: number
  minValue: number
  maxValue: number
  step: number
  enableHistory: boolean
  enablePersistence: boolean
}

export interface CounterProps extends BaseComponent {
  config?: Partial<CounterConfig>
  onValueChange?: (value: number) => void
  onError?: (error: CounterError) => void
}

// =============== CUSTOM ERROR TYPES ===============
export class CounterError extends Error {
  code: string
  value?: number

  constructor(message: string, code: string, value?: number) {
    super(message)
    this.name = 'CounterError'
    this.code = code
    this.value = value
  }
}

export const createCounterError = (
  message: string,
  code: string,
  value?: number
): CounterError => {
  const error = new Error(message) as CounterError
  error.name = 'CounterError'
  error.code = code
  error.value = value
  return error
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: string | null
}

// =============== THEME SYSTEM ===============
export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  text: string
  textSecondary: string
  border: string
  success: string
  warning: string
  error: string
}

export interface ThemeSpacing {
  xs: string
  sm: string
  md: string
  lg: string
  xl: string
  xxl: string
}

export interface ThemeBreakpoints {
  mobile: string
  tablet: string
  desktop: string
  wide: string
}

export interface Theme {
  mode: ThemeMode
  colors: ThemeColors
  spacing: ThemeSpacing
  breakpoints: ThemeBreakpoints
  borderRadius: string
  fontFamily: string
}

export interface ThemeContextValue {
  theme: Theme
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
}

// =============== HOOKS TYPES ===============
export interface UseCounterReturn {
  count: number
  increment: () => void
  decrement: () => void
  reset: () => void
  setValue: (value: number) => void
  isAtMin: boolean
  isAtMax: boolean
  history: CounterHistoryEntry[]
  config: CounterConfig
}

export interface UseLocalStorageReturn<T> {
  value: T
  setValue: (value: T | ((prev: T) => T)) => void
  removeValue: () => void
  isLoading: boolean
  error: string | null
}

export interface UseThemeReturn {
  theme: Theme
  toggleTheme: () => void
  setTheme: (mode: ThemeMode) => void
  isDark: boolean
  isLight: boolean
}

// =============== UTILITY TYPES ===============
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredBy<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

// =============== GENERIC TYPES ===============
export interface ApiResponse<T> {
  data: T
  success: boolean
  message: string
  timestamp: Date
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AsyncState<T> {
  data: T | null
  isLoading: boolean
  error: string | null
  lastFetch: Date | null
}

// =============== EVENT TYPES ===============
export interface CounterChangeEvent {
  type: CounterActionType
  previousValue: number
  newValue: number
  timestamp: Date
}

export interface ThemeChangeEvent {
  previousTheme: ThemeMode
  newTheme: ThemeMode
  timestamp: Date
}

// =============== VALIDATION TYPES ===============
export interface ValidationRule<T> {
  validate: (value: T) => boolean
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export type Validator<T> = (value: T) => ValidationResult

// =============== STORAGE TYPES ===============
export interface StorageAdapter {
  getItem: <T>(key: string) => T | null
  setItem: <T>(key: string, value: T) => void
  removeItem: (key: string) => void
  clear: () => void
}

// =============== ANALYTICS TYPES ===============
export interface AnalyticsEvent {
  name: string
  properties: Record<string, string | number | boolean | null>
  timestamp: Date
  userId?: string
}

export interface CounterAnalytics {
  totalClicks: number
  incrementClicks: number
  decrementClicks: number
  resets: number
  maxValueReached: number
  sessionDuration: number
}