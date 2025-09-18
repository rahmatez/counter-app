/**
 * Error Handling Utilities
 * HOCs, hooks, and utilities for error management
 */

import React from 'react'
import { ErrorBoundary, type ErrorBoundaryProps } from '../components/ErrorBoundary'

// =============== HOC FOR ERROR HANDLING ===============
export function withErrorBoundary<P extends Record<string, unknown>>(
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

  const handleError = React.useCallback((error: Error) => {
    setError(error)
  }, [])

  const throwError = React.useCallback((errorMessage: string) => {
    throw new Error(errorMessage)
  }, [])

  return {
    error,
    resetError,
    handleError,
    throwError,
    hasError: !!error
  }
}

// =============== GLOBAL ERROR HANDLER ===============
export class GlobalErrorHandler {
  private static instance: GlobalErrorHandler
  private errorHandlers: Array<(error: Error) => void> = []

  private constructor() {
    // Setup global error handlers
    window.addEventListener('error', this.handleGlobalError.bind(this))
    window.addEventListener('unhandledrejection', this.handlePromiseRejection.bind(this))
  }

  static getInstance(): GlobalErrorHandler {
    if (!GlobalErrorHandler.instance) {
      GlobalErrorHandler.instance = new GlobalErrorHandler()
    }
    return GlobalErrorHandler.instance
  }

  addErrorHandler(handler: (error: Error) => void): void {
    this.errorHandlers.push(handler)
  }

  removeErrorHandler(handler: (error: Error) => void): void {
    this.errorHandlers = this.errorHandlers.filter(h => h !== handler)
  }

  private handleGlobalError(event: ErrorEvent): void {
    const error = new Error(event.message)
    this.notifyHandlers(error)
  }

  private handlePromiseRejection(event: PromiseRejectionEvent): void {
    const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason))
    this.notifyHandlers(error)
  }

  private notifyHandlers(error: Error): void {
    this.errorHandlers.forEach(handler => {
      try {
        handler(error)
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError)
      }
    })
  }
}