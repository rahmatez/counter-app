/**
 * Custom React Hooks with Advanced TypeScript
 * Reusable hooks for Counter App with full type safety
 */

import { useState, useEffect, useCallback, useReducer, useMemo } from 'react'
import {
  CounterActionType,
  ThemeMode
} from '../types'
import type {
  CounterHistoryEntry,
  UseCounterReturn,
  UseLocalStorageReturn,
  UseThemeReturn,
  CounterConfig,
  CounterState,
  Theme,
  AsyncState,
  ValidationResult,
  Validator
} from '../types'

// =============== useLocalStorage Hook ===============
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): UseLocalStorageReturn<T> {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [storedValue, setStoredValue] = useState<T>(initialValue)

  // Initialize value from localStorage
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        const parsedValue = JSON.parse(item) as T
        setStoredValue(parsedValue)
      }
      setError(null)
    } catch (err) {
      setError(`Failed to read from localStorage: ${err}`)
      console.error(`useLocalStorage error for key "${key}":`, err)
    } finally {
      setIsLoading(false)
    }
  }, [key])

  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        setError(null)
        const valueToStore = value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (err) {
        setError(`Failed to write to localStorage: ${err}`)
        console.error(`useLocalStorage setValue error for key "${key}":`, err)
      }
    },
    [key, storedValue]
  )

  const removeValue = useCallback(() => {
    try {
      setError(null)
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (err) {
      setError(`Failed to remove from localStorage: ${err}`)
      console.error(`useLocalStorage removeValue error for key "${key}":`, err)
    }
  }, [key, initialValue])

  return {
    value: storedValue,
    setValue,
    removeValue,
    isLoading,
    error
  }
}

// =============== Counter Reducer ===============
interface CounterAction {
  type: CounterActionType
  payload?: number
}

function counterReducer(state: CounterState, action: CounterAction): CounterState {
  const createHistoryEntry = (
    actionType: CounterActionType,
    previousValue: number,
    newValue: number
  ): CounterHistoryEntry => ({
    id: crypto.randomUUID(),
    action: actionType,
    previousValue,
    newValue,
    timestamp: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  })

  switch (action.type) {
    case CounterActionType.INCREMENT: {
      const incrementedValue = state.value + 1
      return {
        ...state,
        value: incrementedValue,
        history: [
          ...state.history,
          createHistoryEntry(CounterActionType.INCREMENT, state.value, incrementedValue)
        ]
      }
    }

    case CounterActionType.DECREMENT: {
      const decrementedValue = Math.max(0, state.value - 1)
      return {
        ...state,
        value: decrementedValue,
        history: [
          ...state.history,
          createHistoryEntry(CounterActionType.DECREMENT, state.value, decrementedValue)
        ]
      }
    }

    case CounterActionType.RESET: {
      return {
        ...state,
        value: 0,
        history: [
          ...state.history,
          createHistoryEntry(CounterActionType.RESET, state.value, 0)
        ]
      }
    }

    case CounterActionType.SET_VALUE: {
      const newValue = action.payload ?? 0
      return {
        ...state,
        value: newValue,
        history: [
          ...state.history,
          createHistoryEntry(CounterActionType.SET_VALUE, state.value, newValue)
        ]
      }
    }

    default:
      return state
  }
}

// =============== useCounter Hook ===============
export function useCounter(
  initialConfig: Partial<CounterConfig> = {}
): UseCounterReturn {
  const config = useMemo<CounterConfig>(() => {
    const defaultConfig: CounterConfig = {
      initialValue: 0,
      minValue: 0,
      maxValue: Number.MAX_SAFE_INTEGER,
      step: 1,
      enableHistory: true,
      enablePersistence: false
    }
    return { ...defaultConfig, ...initialConfig }
  }, [initialConfig])

  const initialState: CounterState = {
    value: config.initialValue,
    isLoading: false,
    error: null,
    history: []
  }

  const [state, dispatch] = useReducer(counterReducer, initialState)

  // Persistence with localStorage
  const { setValue: persistValue } = useLocalStorage(
    'counter-value',
    config.initialValue
  )

  useEffect(() => {
    if (config.enablePersistence) {
      persistValue(state.value)
    }
  }, [state.value, config.enablePersistence, persistValue])

  const increment = useCallback(() => {
    if (state.value < config.maxValue) {
      dispatch({ type: CounterActionType.INCREMENT })
    }
  }, [state.value, config.maxValue])

  const decrement = useCallback(() => {
    if (state.value > config.minValue) {
      dispatch({ type: CounterActionType.DECREMENT })
    }
  }, [state.value, config.minValue])

  const reset = useCallback(() => {
    dispatch({ type: CounterActionType.RESET })
  }, [])

  const setValue = useCallback((value: number) => {
    const clampedValue = Math.max(
      config.minValue,
      Math.min(config.maxValue, value)
    )
    dispatch({ type: CounterActionType.SET_VALUE, payload: clampedValue })
  }, [config.minValue, config.maxValue])

  const isAtMin = useMemo(() => state.value <= config.minValue, [state.value, config.minValue])
  const isAtMax = useMemo(() => state.value >= config.maxValue, [state.value, config.maxValue])

  return {
    count: state.value,
    increment,
    decrement,
    reset,
    setValue,
    isAtMin,
    isAtMax,
    history: config.enableHistory ? state.history : [],
    config
  }
}

// =============== useTheme Hook ===============
export function useTheme(): UseThemeReturn {
  const themeStorage = useLocalStorage<ThemeMode>(
    'theme-mode',
    ThemeMode.SYSTEM
  )

  const [systemTheme, setSystemTheme] = useState<ThemeMode>(
    window.matchMedia('(prefers-color-scheme: dark)').matches
      ? ThemeMode.DARK
      : ThemeMode.LIGHT
  )

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? ThemeMode.DARK : ThemeMode.LIGHT)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const currentTheme = useMemo<ThemeMode>(() => {
    if (themeStorage.value === ThemeMode.SYSTEM) {
      return systemTheme
    }
    return themeStorage.value
  }, [themeStorage.value, systemTheme])

  const theme = useMemo<Theme>(() => {
    const isDark = currentTheme === ThemeMode.DARK

    return {
      mode: currentTheme,
      colors: {
        primary: isDark ? '#3b82f6' : '#2563eb',
        secondary: isDark ? '#64748b' : '#475569',
        accent: isDark ? '#f59e0b' : '#d97706',
        background: isDark ? '#0f172a' : '#ffffff',
        surface: isDark ? '#1e293b' : '#f8fafc',
        text: isDark ? '#f1f5f9' : '#0f172a',
        textSecondary: isDark ? '#94a3b8' : '#64748b',
        border: isDark ? '#334155' : '#e2e8f0',
        success: isDark ? '#10b981' : '#059669',
        warning: isDark ? '#f59e0b' : '#d97706',
        error: isDark ? '#ef4444' : '#dc2626'
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
        wide: '1280px'
      },
      borderRadius: '0.5rem',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }
  }, [currentTheme])

  const toggleTheme = useCallback(() => {
    const nextMode = currentTheme === ThemeMode.DARK ? ThemeMode.LIGHT : ThemeMode.DARK
    themeStorage.setValue(nextMode)
  }, [currentTheme, themeStorage])

  const setTheme = useCallback((mode: ThemeMode) => {
    themeStorage.setValue(mode)
  }, [themeStorage])

  return {
    theme,
    toggleTheme,
    setTheme,
    isDark: currentTheme === ThemeMode.DARK,
    isLight: currentTheme === ThemeMode.LIGHT
  }
}

// =============== useAsync Hook ===============
export function useAsync<T, Args extends unknown[]>(
  asyncFunction: (...args: Args) => Promise<T>
): [AsyncState<T>, (...args: Args) => Promise<void>] {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    isLoading: false,
    error: null,
    lastFetch: null
  })

  const execute = useCallback(
    async (...args: Args) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }))
      
      try {
        const data = await asyncFunction(...args)
        setState({
          data,
          isLoading: false,
          error: null,
          lastFetch: new Date()
        })
      } catch (error) {
        setState({
          data: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'An error occurred',
          lastFetch: new Date()
        })
      }
    },
    [asyncFunction]
  )

  return [state, execute]
}

// =============== useValidation Hook ===============
export function useValidation<T>(
  initialValue: T,
  validators: Validator<T>[]
): {
  value: T
  setValue: (value: T) => void
  validation: ValidationResult
  isValid: boolean
  errors: string[]
} {
  const [value, setValue] = useState<T>(initialValue)

  const validation = useMemo<ValidationResult>(() => {
    const errors: string[] = []
    
    for (const validator of validators) {
      const result = validator(value)
      if (!result.isValid) {
        errors.push(...result.errors)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }, [value, validators])

  return {
    value,
    setValue,
    validation,
    isValid: validation.isValid,
    errors: validation.errors
  }
}

// =============== useDebounce Hook ===============
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}