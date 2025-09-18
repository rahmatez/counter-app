/**
 * React Context Providers with Advanced TypeScript
 * Global state management with type safety
 */

import React, { createContext, useReducer, useMemo } from 'react'
import {
  CounterActionType,
  ThemeMode
} from '../types'
import type {
  ThemeContextValue,
  Theme,
  CounterState,
  CounterError,
  DeepPartial
} from '../types'
import { useTheme, useLocalStorage } from '../hooks'

// =============== Theme Context ===============
const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeMode
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children 
}) => {
  const themeHook = useTheme()

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

// =============== App State Context ===============
interface AppState {
  counter: CounterState
  theme: Theme
  settings: AppSettings
  analytics: AnalyticsData
}

interface AppSettings {
  soundEnabled: boolean
  animationsEnabled: boolean
  autoSave: boolean
  language: string
  notifications: boolean
}

interface AnalyticsData {
  totalInteractions: number
  sessionStartTime: Date
  counterClicks: number
  themeChanges: number
  errorCount: number
}

type AppAction =
  | { type: 'COUNTER_INCREMENT' }
  | { type: 'COUNTER_DECREMENT' }
  | { type: 'COUNTER_RESET' }
  | { type: 'COUNTER_SET_VALUE'; payload: number }
  | { type: 'COUNTER_SET_ERROR'; payload: CounterError | null }
  | { type: 'SETTINGS_UPDATE'; payload: DeepPartial<AppSettings> }
  | { type: 'ANALYTICS_INCREMENT_INTERACTIONS' }
  | { type: 'ANALYTICS_TRACK_ERROR' }
  | { type: 'THEME_CHANGE'; payload: Theme }

const initialAppState: AppState = {
  counter: {
    value: 0,
    isLoading: false,
    error: null,
    history: []
  },
  theme: {} as Theme, // Will be set by ThemeProvider
  settings: {
    soundEnabled: true,
    animationsEnabled: true,
    autoSave: true,
    language: 'en',
    notifications: true
  },
  analytics: {
    totalInteractions: 0,
    sessionStartTime: new Date(),
    counterClicks: 0,
    themeChanges: 0,
    errorCount: 0
  }
}

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'COUNTER_INCREMENT':
      return {
        ...state,
        counter: {
          ...state.counter,
          value: state.counter.value + 1,
          history: [
            ...state.counter.history,
            {
              id: crypto.randomUUID(),
              action: CounterActionType.INCREMENT,
              previousValue: state.counter.value,
              newValue: state.counter.value + 1,
              timestamp: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]
        },
        analytics: {
          ...state.analytics,
          totalInteractions: state.analytics.totalInteractions + 1,
          counterClicks: state.analytics.counterClicks + 1
        }
      }

    case 'COUNTER_DECREMENT': {
      const newValue = Math.max(0, state.counter.value - 1)
      return {
        ...state,
        counter: {
          ...state.counter,
          value: newValue,
          history: [
            ...state.counter.history,
            {
              id: crypto.randomUUID(),
              action: CounterActionType.DECREMENT,
              previousValue: state.counter.value,
              newValue,
              timestamp: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]
        },
        analytics: {
          ...state.analytics,
          totalInteractions: state.analytics.totalInteractions + 1,
          counterClicks: state.analytics.counterClicks + 1
        }
      }
    }

    case 'COUNTER_RESET':
      return {
        ...state,
        counter: {
          ...state.counter,
          value: 0,
          history: [
            ...state.counter.history,
            {
              id: crypto.randomUUID(),
              action: CounterActionType.RESET,
              previousValue: state.counter.value,
              newValue: 0,
              timestamp: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]
        },
        analytics: {
          ...state.analytics,
          totalInteractions: state.analytics.totalInteractions + 1
        }
      }

    case 'COUNTER_SET_VALUE':
      return {
        ...state,
        counter: {
          ...state.counter,
          value: action.payload,
          history: [
            ...state.counter.history,
            {
              id: crypto.randomUUID(),
              action: CounterActionType.SET_VALUE,
              previousValue: state.counter.value,
              newValue: action.payload,
              timestamp: new Date(),
              createdAt: new Date(),
              updatedAt: new Date()
            }
          ]
        }
      }

    case 'COUNTER_SET_ERROR':
      return {
        ...state,
        counter: {
          ...state.counter,
          error: action.payload?.message || null
        },
        analytics: action.payload 
          ? {
              ...state.analytics,
              errorCount: state.analytics.errorCount + 1
            }
          : state.analytics
      }

    case 'SETTINGS_UPDATE':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload
        }
      }

    case 'ANALYTICS_INCREMENT_INTERACTIONS':
      return {
        ...state,
        analytics: {
          ...state.analytics,
          totalInteractions: state.analytics.totalInteractions + 1
        }
      }

    case 'ANALYTICS_TRACK_ERROR':
      return {
        ...state,
        analytics: {
          ...state.analytics,
          errorCount: state.analytics.errorCount + 1
        }
      }

    case 'THEME_CHANGE':
      return {
        ...state,
        theme: action.payload,
        analytics: {
          ...state.analytics,
          themeChanges: state.analytics.themeChanges + 1,
          totalInteractions: state.analytics.totalInteractions + 1
        }
      }

    default:
      return state
  }
}

// =============== App Context ===============
interface AppContextValue {
  state: AppState
  actions: {
    counter: {
      increment: () => void
      decrement: () => void
      reset: () => void
      setValue: (value: number) => void
      setError: (error: CounterError | null) => void
    }
    settings: {
      updateSettings: (settings: DeepPartial<AppSettings>) => void
      toggleSound: () => void
      toggleAnimations: () => void
      toggleAutoSave: () => void
      toggleNotifications: () => void
    }
    analytics: {
      incrementInteractions: () => void
      trackError: () => void
    }
    theme: {
      setTheme: (theme: Theme) => void
    }
  }
}

const AppContext = createContext<AppContextValue | undefined>(undefined)

export interface AppProviderProps {
  children: React.ReactNode
  initialState?: DeepPartial<AppState>
}

export const AppProvider: React.FC<AppProviderProps> = ({ 
  children
}) => {
  const [state, dispatch] = useReducer(appReducer, initialAppState)

  // Persistence
  const { setValue: saveState } = useLocalStorage('app-state', state)

  // Auto-save when settings.autoSave is enabled
  React.useEffect(() => {
    if (state.settings.autoSave) {
      saveState(state)
    }
  }, [state, saveState])

  const actions = useMemo<AppContextValue['actions']>(() => ({
    counter: {
      increment: () => dispatch({ type: 'COUNTER_INCREMENT' }),
      decrement: () => dispatch({ type: 'COUNTER_DECREMENT' }),
      reset: () => dispatch({ type: 'COUNTER_RESET' }),
      setValue: (value: number) => dispatch({ type: 'COUNTER_SET_VALUE', payload: value }),
      setError: (error: CounterError | null) => dispatch({ type: 'COUNTER_SET_ERROR', payload: error })
    },
    settings: {
      updateSettings: (settings: DeepPartial<AppSettings>) => 
        dispatch({ type: 'SETTINGS_UPDATE', payload: settings }),
      toggleSound: () => 
        dispatch({ type: 'SETTINGS_UPDATE', payload: { soundEnabled: !state.settings.soundEnabled } }),
      toggleAnimations: () => 
        dispatch({ type: 'SETTINGS_UPDATE', payload: { animationsEnabled: !state.settings.animationsEnabled } }),
      toggleAutoSave: () => 
        dispatch({ type: 'SETTINGS_UPDATE', payload: { autoSave: !state.settings.autoSave } }),
      toggleNotifications: () => 
        dispatch({ type: 'SETTINGS_UPDATE', payload: { notifications: !state.settings.notifications } })
    },
    analytics: {
      incrementInteractions: () => dispatch({ type: 'ANALYTICS_INCREMENT_INTERACTIONS' }),
      trackError: () => dispatch({ type: 'ANALYTICS_TRACK_ERROR' })
    },
    theme: {
      setTheme: (theme: Theme) => dispatch({ type: 'THEME_CHANGE', payload: theme })
    }
  }), [state.settings])

  const contextValue = useMemo<AppContextValue>(() => ({
    state,
    actions
  }), [state, actions])

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  )
}

// =============== Root Provider ===============
export interface RootProviderProps {
  children: React.ReactNode
}

export const RootProvider: React.FC<RootProviderProps> = ({ children }) => {
  return (
    <ThemeProvider>
      <AppProvider>
        {children}
      </AppProvider>
    </ThemeProvider>
  )
}