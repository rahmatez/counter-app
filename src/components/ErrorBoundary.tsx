/**
 * TypeScript Error Boundaries and Error Handling Components
 * Comprehensive error management with strict typing
 */

import React, { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import type {
  ErrorBoundaryState
} from '../types'
import { CounterError } from '../types'
import { createAnalyticsEvent, trackEvent, handleError } from '../utils'

// =============== BASE ERROR BOUNDARY ===============
export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  resetOnPropsChange?: boolean
  resetKeys?: Array<string | number>
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private previousResetKeys: Array<string | number> = []

  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      errorInfo: errorInfo.componentStack || null
    })

    // Track error analytics
    const analyticsEvent = createAnalyticsEvent('error_boundary_triggered', {
      errorMessage: error.message,
      errorStack: error.stack,
      componentStack: errorInfo.componentStack || null,
      errorBoundary: this.constructor.name
    })
    trackEvent(analyticsEvent)

    // Call custom error handler
    this.props.onError?.(error, errorInfo)

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo)
    }
  }

  componentDidUpdate(): void {
    const { resetOnPropsChange, resetKeys } = this.props
    const { hasError } = this.state

    if (hasError && resetOnPropsChange) {
      if (resetKeys) {
        const hasResetKeyChanged = resetKeys.some(
          (key, index) => key !== this.previousResetKeys[index]
        )
        if (hasResetKeyChanged) {
          this.resetErrorBoundary()
        }
        this.previousResetKeys = resetKeys
      }
    }
  }

  resetErrorBoundary = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  render(): ReactNode {
    const { hasError, error, errorInfo } = this.state
    const { children, fallback } = this.props

    if (hasError && error) {
      if (fallback) {
        return fallback(error, { componentStack: errorInfo } as ErrorInfo)
      }

      return <DefaultErrorFallback error={error} resetError={this.resetErrorBoundary} />
    }

    return children
  }
}

// =============== DEFAULT ERROR FALLBACK ===============
interface DefaultErrorFallbackProps {
  error: Error
  resetError: () => void
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({ error, resetError }) => {
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <div className="error-boundary-fallback" role="alert">
      <div className="error-content">
        <h2>🚨 Something went wrong</h2>
        <p>We're sorry, but something unexpected happened.</p>
        
        {isDevelopment && (
          <details className="error-details">
            <summary>Error Details (Development Mode)</summary>
            <pre className="error-message">{error.message}</pre>
            {error.stack && (
              <pre className="error-stack">{error.stack}</pre>
            )}
          </details>
        )}

        <div className="error-actions">
          <button
            type="button"
            onClick={resetError}
            className="error-button primary"
          >
            Try Again
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="error-button secondary"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  )
}

// =============== COUNTER ERROR BOUNDARY ===============
interface CounterErrorBoundaryProps extends Omit<ErrorBoundaryProps, 'fallback'> {
  onCounterError?: (error: CounterError) => void
}

export const CounterErrorBoundary: React.FC<CounterErrorBoundaryProps> = ({
  children,
  onCounterError,
  ...props
}) => {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    if (error instanceof CounterError) {
      onCounterError?.(error)
    }
    props.onError?.(error, errorInfo)
  }

  const renderFallback = (error: Error) => {
    if (error instanceof CounterError) {
      return <CounterErrorFallback error={error} />
    }
    return <DefaultErrorFallback error={error} resetError={() => {}} />
  }

  return (
    <ErrorBoundary
      {...props}
      onError={handleError}
      fallback={renderFallback}
    >
      {children}
    </ErrorBoundary>
  )
}

// =============== COUNTER ERROR FALLBACK ===============
interface CounterErrorFallbackProps {
  error: CounterError
}

const CounterErrorFallback: React.FC<CounterErrorFallbackProps> = ({ error }) => {
  return (
    <div className="counter-error-fallback">
      <div className="error-icon">⚠️</div>
      <h3>Counter Error</h3>
      <p>{error.message}</p>
      <div className="error-meta">
        <span className="error-code">Code: {error.code}</span>
        {error.value !== undefined && (
          <span className="error-value">Value: {error.value}</span>
        )}
      </div>
    </div>
  )
}

// =============== ASYNC ERROR BOUNDARY ===============
interface AsyncErrorBoundaryState extends ErrorBoundaryState {
  isRetrying: boolean
  retryCount: number
}

interface AsyncErrorBoundaryProps extends ErrorBoundaryProps {
  maxRetries?: number
  retryDelay?: number
  onRetry?: () => Promise<void>
}

export class AsyncErrorBoundary extends Component<
  AsyncErrorBoundaryProps,
  AsyncErrorBoundaryState
> {
  private retryTimeout: NodeJS.Timeout | null = null

  constructor(props: AsyncErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      isRetrying: false,
      retryCount: 0
    }
  }

  static getDerivedStateFromError(error: Error): Partial<AsyncErrorBoundaryState> {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({
      errorInfo: errorInfo.componentStack || null
    })

    this.props.onError?.(error, errorInfo)
  }

  componentWillUnmount(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout)
    }
  }

  handleRetry = async (): Promise<void> => {
    const { maxRetries = 3, retryDelay = 1000, onRetry } = this.props
    const { retryCount } = this.state

    if (retryCount >= maxRetries) {
      return
    }

    this.setState({ isRetrying: true })

    try {
      if (onRetry) {
        await onRetry()
      }

      this.retryTimeout = setTimeout(() => {
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          isRetrying: false,
          retryCount: retryCount + 1
        })
      }, retryDelay)
    } catch (retryError) {
      this.setState({
        isRetrying: false,
        retryCount: retryCount + 1
      })
    }
  }

  render(): ReactNode {
    const { hasError, error, isRetrying, retryCount } = this.state
    const { children, fallback, maxRetries = 3 } = this.props

    if (hasError && error) {
      if (fallback) {
        return fallback(error, { componentStack: this.state.errorInfo } as ErrorInfo)
      }

      return (
        <AsyncErrorFallback
          error={error}
          isRetrying={isRetrying}
          retryCount={retryCount}
          maxRetries={maxRetries}
          onRetry={this.handleRetry}
        />
      )
    }

    return children
  }
}

// =============== ASYNC ERROR FALLBACK ===============
interface AsyncErrorFallbackProps {
  error: Error
  isRetrying: boolean
  retryCount: number
  maxRetries: number
  onRetry: () => void
}

const AsyncErrorFallback: React.FC<AsyncErrorFallbackProps> = ({
  error,
  isRetrying,
  retryCount,
  maxRetries,
  onRetry
}) => {
  const canRetry = retryCount < maxRetries

  return (
    <div className="async-error-fallback">
      <div className="error-content">
        <h3>🔄 Operation Failed</h3>
        <p>{handleError(error)}</p>
        
        <div className="retry-info">
          <span>Retry attempts: {retryCount}/{maxRetries}</span>
        </div>

        <div className="error-actions">
          {canRetry && (
            <button
              type="button"
              onClick={onRetry}
              disabled={isRetrying}
              className="error-button primary"
            >
              {isRetrying ? 'Retrying...' : 'Retry'}
            </button>
          )}
          {!canRetry && (
            <p className="max-retries-message">
              Maximum retry attempts reached. Please refresh the page.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// =============== HOC FOR ERROR HANDLING ===============
export function withErrorBoundary<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Partial<ErrorBoundaryProps>
): React.ComponentType<P> {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}

// =============== ERROR BOUNDARY HOOK ===============
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null)

  const resetError = React.useCallback(() => {
    setError(null)
  }, [])

  const captureError = React.useCallback((error: Error | string) => {
    const errorInstance = typeof error === 'string' ? new Error(error) : error
    setError(errorInstance)
  }, [])

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return { captureError, resetError }
}

// =============== GLOBAL ERROR HANDLER ===============
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler | null = null
  private errorListeners: Array<(error: Error) => void> = []

  private constructor() {
    this.setupGlobalErrorHandlers()
  }

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler()
    }
    return GlobalErrorHandler.instance
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled errors
    window.addEventListener('error', (event) => {
      this.handleError(new Error(event.message))
    })

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(new Error(event.reason))
    })
  }

  addErrorListener(listener: (error: Error) => void): void {
    this.errorListeners.push(listener)
  }

  removeErrorListener(listener: (error: Error) => void): void {
    const index = this.errorListeners.indexOf(listener)
    if (index > -1) {
      this.errorListeners.splice(index, 1)
    }
  }

  private handleError(error: Error): void {
    // Track error analytics
    const analyticsEvent = createAnalyticsEvent('global_error', {
      errorMessage: error.message,
      errorStack: error.stack,
      userAgent: navigator.userAgent,
      url: window.location.href
    })
    trackEvent(analyticsEvent)

    // Notify listeners
    this.errorListeners.forEach(listener => {
      try {
        listener(error)
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError)
      }
    })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Global error handler:', error)
    }
  }
}

// Initialize global error handler
GlobalErrorHandler.getInstance()