import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error cleanly for production telemetry / console debugging
    console.error('GYMTrack Uncaught UI Error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-surface-50 flex items-center justify-center p-4 sm:p-6 text-surface-900">
          <div className="max-w-md w-full bg-white rounded-2xl border border-surface-200 shadow-xl p-6 sm:p-8 text-center">
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-500">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            <h1 className="text-xl font-bold text-surface-900 mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-surface-500 mb-6 leading-relaxed">
              GYMTrack encountered an unexpected interface error. Your workout data and progress remain safely stored.
            </p>

            {this.state.error && (
              <details className="text-left mb-6 bg-surface-50 rounded-lg p-3 text-xs border border-surface-200">
                <summary className="font-semibold text-surface-600 cursor-pointer select-none">
                  Technical Details
                </summary>
                <p className="mt-2 font-mono text-red-600 break-words">
                  {this.state.error.message || String(this.state.error)}
                </p>
              </details>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 px-4 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-lg text-sm transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 px-4 py-2.5 bg-surface-100 hover:bg-surface-200 text-surface-700 font-medium rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-surface-400 focus:ring-offset-2"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
