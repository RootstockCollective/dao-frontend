import { Paragraph } from '@/components/Typography'
import { CloseIcon, CircleCheckIcon, ExclamationCircleIcon } from '../Icons'
import { ReactNode } from 'react'

export interface AlertProps {
  severity: 'error' | 'success' | 'info' | 'warning'
  title: string
  content: string | ReactNode
  onDismiss?: (() => void) | null
  'data-testid'?: string
}

const IconToUse = {
  error: <ExclamationCircleIcon size={20} color="rgba(217,45,32,1)" />,
  info: <ExclamationCircleIcon size={20} color="cyan" />,
  success: <CircleCheckIcon size={20} color="rgba(7,148,85,1)" />,
  warning: <ExclamationCircleIcon size={20} color="rgba(255,193,7,1)" />,
}

export const Alert = ({ severity, title, content, onDismiss, 'data-testid': dataTestId }: AlertProps) => {
  return (
    <div
      className="container relative flex border border-gray-300 p-[16px] rounded-[12px] gap-[16px] bg-input-bg mb-4"
      data-testid={`Alert${dataTestId || ''}`}
    >
      {/* Icon */}
      {IconToUse[severity]}
      {/* Main content */}
      <div className="flex-1">
        <Paragraph className="leading-5 mb-[6px] text-[16px]" data-testid="Title">
          {title}
        </Paragraph>
        {typeof content === 'string' ? (
          <Paragraph
            variant="light"
            className="font-[600] text-[14px] text-white opacity-80 mb-[12px] break-all"
            data-testid="Content"
          >
            {content}
          </Paragraph>
        ) : (
          content
        )}
        {onDismiss && (
          <div onClick={onDismiss} className="cursor-pointer">
            <Paragraph variant="light" className="text-[14px]" data-testid="Dismiss">
              Dismiss
            </Paragraph>
          </div>
        )}
      </div>
      {/* X */}
      {onDismiss && <CloseIcon size={20} className="cursor-pointer" onClick={onDismiss} />}
    </div>
  )
}
