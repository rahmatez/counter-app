/**
 * TypeScript Utility Functions and Helpers
 * Comprehensive utility library with strict typing
 */

import type {
  ValidationResult,
  Validator,
  DeepPartial,
  StorageAdapter,
  AnalyticsEvent
} from '../types'
import { CounterError } from '../types'

// =============== TYPE GUARDS ===============
export const isString = (value: unknown): value is string => {
  return typeof value === 'string'
}

export const isNumber = (value: unknown): value is number => {
  return typeof value === 'number' && !isNaN(value)
}

export const isBoolean = (value: unknown): value is boolean => {
  return typeof value === 'boolean'
}

export const isObject = (value: unknown): value is Record<string, unknown> => {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

export const isArray = <T>(value: unknown): value is T[] => {
  return Array.isArray(value)
}

export const isFunction = (value: unknown): value is Function => {
  return typeof value === 'function'
}

export const isDefined = <T>(value: T | undefined | null): value is T => {
  return value !== undefined && value !== null
}

export const isNotEmpty = (value: string | any[]): boolean => {
  return value.length > 0
}

// =============== VALIDATION UTILITIES ===============
export const createValidator = <T>(
  predicate: (value: T) => boolean,
  errorMessage: string
): Validator<T> => {
  return (value: T): ValidationResult => ({
    isValid: predicate(value),
    errors: predicate(value) ? [] : [errorMessage]
  })
}

export const combineValidators = <T>(...validators: Validator<T>[]): Validator<T> => {
  return (value: T): ValidationResult => {
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
  }
}

// Number validators
export const isPositiveNumber: Validator<number> = createValidator(
  (value: number) => value > 0,
  'Value must be positive'
)

export const isNonNegativeNumber: Validator<number> = createValidator(
  (value: number) => value >= 0,
  'Value must be non-negative'
)

export const isIntegerNumber: Validator<number> = createValidator(
  (value: number) => Number.isInteger(value),
  'Value must be an integer'
)

export const isInRange = (min: number, max: number): Validator<number> => 
  createValidator(
    (value: number) => value >= min && value <= max,
    `Value must be between ${min} and ${max}`
  )

// String validators
export const isNonEmptyString: Validator<string> = createValidator(
  (value: string) => value.trim().length > 0,
  'Value cannot be empty'
)

export const hasMinLength = (minLength: number): Validator<string> =>
  createValidator(
    (value: string) => value.length >= minLength,
    `Value must be at least ${minLength} characters long`
  )

export const hasMaxLength = (maxLength: number): Validator<string> =>
  createValidator(
    (value: string) => value.length <= maxLength,
    `Value must be at most ${maxLength} characters long`
  )

export const matchesPattern = (pattern: RegExp, errorMessage: string): Validator<string> =>
  createValidator(
    (value: string) => pattern.test(value),
    errorMessage
  )

// =============== OBJECT UTILITIES ===============
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as unknown as T
  if (typeof obj === 'object') {
    const clonedObj = {} as { [key: string]: any }
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone((obj as any)[key])
      }
    }
    return clonedObj as T
  }
  return obj
}

export const deepMerge = <T extends Record<string, any>>(
  target: T,
  ...sources: DeepPartial<T>[]
): T => {
  if (!sources.length) return target
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deepMerge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deepMerge(target, ...sources)
}

export const pick = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> => {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

export const omit = <T extends Record<string, any>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  const result = { ...obj } as any
  keys.forEach(key => {
    delete result[key]
  })
  return result as Omit<T, K>
}

export const isEmpty = (obj: any): boolean => {
  if (obj == null) return true
  if (typeof obj === 'string' || Array.isArray(obj)) return obj.length === 0
  if (typeof obj === 'object') return Object.keys(obj).length === 0
  return false
}

// =============== ARRAY UTILITIES ===============
export const unique = <T>(array: T[]): T[] => {
  return Array.from(new Set(array))
}

export const groupBy = <T, K extends keyof any>(
  array: T[],
  getKey: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const key = getKey(item)
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(item)
    return groups
  }, {} as Record<K, T[]>)
}

export const sortBy = <T>(
  array: T[],
  getKey: (item: T) => string | number,
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...array].sort((a, b) => {
    const aKey = getKey(a)
    const bKey = getKey(b)
    
    if (aKey < bKey) return direction === 'asc' ? -1 : 1
    if (aKey > bKey) return direction === 'asc' ? 1 : -1
    return 0
  })
}

export const chunk = <T>(array: T[], size: number): T[][] => {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

// =============== ASYNC UTILITIES ===============
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const timeout = <T>(promise: Promise<T>, ms: number): Promise<T> => {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(`Operation timed out after ${ms}ms`)), ms)
  })
  
  return Promise.race([promise, timeoutPromise])
}

export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 1000
): Promise<T> => {
  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      
      if (attempt === maxAttempts) {
        throw lastError
      }
      
      await delay(delayMs * attempt)
    }
  }
  
  throw lastError!
}

// =============== ERROR UTILITIES ===============
export const createCounterError = (
  message: string,
  code: string,
  value?: number
): CounterError => {
  return new CounterError(message, code, value)
}

export const isCounterError = (error: unknown): error is CounterError => {
  return error instanceof CounterError
}

export const handleError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unknown error occurred'
}

// =============== FORMAT UTILITIES ===============
export const formatNumber = (
  value: number,
  options: Intl.NumberFormatOptions = {}
): string => {
  return new Intl.NumberFormat('en-US', options).format(value)
}

export const formatCurrency = (value: number, currency: string = 'USD'): string => {
  return formatNumber(value, {
    style: 'currency',
    currency
  })
}

export const formatPercentage = (value: number, decimals: number = 2): string => {
  return formatNumber(value / 100, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

export const formatDate = (
  date: Date,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  }).format(date)
}

export const formatRelativeTime = (date: Date): string => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return formatDate(date)
}

// =============== STORAGE UTILITIES ===============
export const createStorageAdapter = (storage: Storage): StorageAdapter => ({
  getItem: <T>(key: string): T | null => {
    try {
      const item = storage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch {
      return null
    }
  },
  
  setItem: <T>(key: string, value: T): void => {
    try {
      storage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error('Failed to save to storage:', error)
    }
  },
  
  removeItem: (key: string): void => {
    try {
      storage.removeItem(key)
    } catch (error) {
      console.error('Failed to remove from storage:', error)
    }
  },
  
  clear: (): void => {
    try {
      storage.clear()
    } catch (error) {
      console.error('Failed to clear storage:', error)
    }
  }
})

export const localStorageAdapter = createStorageAdapter(localStorage)
export const sessionStorageAdapter = createStorageAdapter(sessionStorage)

// =============== PERFORMANCE UTILITIES ===============
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout | undefined
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export const memoize = <T extends (...args: any[]) => any>(
  func: T
): T => {
  const cache = new Map()
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args)
    if (cache.has(key)) {
      return cache.get(key)
    }
    
    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}

// =============== ANALYTICS UTILITIES ===============
export const createAnalyticsEvent = (
  name: string,
  properties: Record<string, any> = {},
  userId?: string
): AnalyticsEvent => ({
  name,
  properties,
  timestamp: new Date(),
  userId
})

export const trackEvent = (event: AnalyticsEvent): void => {
  // In a real app, this would send to analytics service
  console.log('Analytics Event:', event)
}

// =============== URL UTILITIES ===============
export const parseQueryParams = (search: string): Record<string, string> => {
  return Object.fromEntries(new URLSearchParams(search))
}

export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams()
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })
  
  return searchParams.toString()
}

// =============== CLASS NAME UTILITIES ===============
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}

export const conditionalClass = (
  condition: boolean,
  trueClass: string,
  falseClass: string = ''
): string => {
  return condition ? trueClass : falseClass
}

// Re-export error utilities
export * from './errorUtils'