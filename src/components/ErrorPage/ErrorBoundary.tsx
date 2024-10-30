// components/ErrorBoundary.js
import { Component, ErrorInfo, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { BG_IMG_CLASSES } from '@/shared/utils'
import { Headline, Paragraph } from '@/components/Typography'
import { HeaderText } from '@/components/HeaderText/HeaderText'
import { Button } from '@/components/Button'
import { ErrorThrowerContextProvider } from '@/components/ErrorPage/ErrorThrowerContext'
import { checkForCommonErrors, commonErrors } from './commonErrors'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error to an error reporting service console
    console.error('Error caught by Error Boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      let errorString = 'An unknown error occurred.'
      if (this.state.error instanceof Error) {
        errorString = checkForCommonErrors(this.state.error)
      }
      return (
        <div
          className={cn(
            BG_IMG_CLASSES,
            'w-screen h-screen flex flex-row justify-start items-center bg-black',
          )}
        >
          <div className="w-1/2 flex flex-col items-center">
            <HeaderText />
            <Headline>ERROR OCCURRED</Headline>
            <Paragraph className="mb-8">{errorString}</Paragraph>
            <Button variant="white" onClick={() => (window.location.href = '/')}>
              Try again
            </Button>
          </div>
        </div>
      )
    }

    return <ErrorThrowerContextProvider>{this.props.children}</ErrorThrowerContextProvider>
  }
}

export default ErrorBoundary
