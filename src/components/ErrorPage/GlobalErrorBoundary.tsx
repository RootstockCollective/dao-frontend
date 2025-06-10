import { ReactNode } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { cn } from '@/lib/utils'
import { BG_IMG_CLASSES } from '@/shared/utils'
import { Headline, Paragraph } from '@/components/Typography'
import { HeaderText } from '@/components/HeaderText/HeaderText'
import { Button } from '@/components/Button'
import { checkForCommonErrors } from './commonErrors'

interface ErrorFallbackProps {
  error: Error
}

function ErrorFallback({ error }: ErrorFallbackProps) {
  const errorString = checkForCommonErrors(error)

  return (
    <div
      className={cn(BG_IMG_CLASSES, 'w-screen h-screen flex flex-row justify-start items-center bg-black')}
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

interface Props {
  children: ReactNode
}

export const GlobalErrorBoundary = ({ children }: Props) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, info) => {
        console.error('Error caught by Custom Error Boundary:', error, info)
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
