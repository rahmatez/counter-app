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
    } catch {
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