import { FC, useState, useEffect, ReactNode, ReactElement, useRef, HTMLAttributes } from 'react'
import { BiCopy } from 'react-icons/bi'
import { cn } from '@/lib/utils'

export interface CopyButtonProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Text to be copied to the clipboard.
   */
  copyText: string
  /**
   * Custom message to show upon successfully copying text
   */
  successLabel?: ReactNode
  /**
   * Custom message to show upon error
   */
  errorLabel?: ReactNode
  /**
   * Component to replace the default icon. To display no icon pass `null` value
   */
  icon?: ReactElement | null
  /**
   * Callback function to execute upon successfully copying text to the clipboard.
   */
  onCopySuccess?: () => void
  /**
   * Callback function to execute if copying text to the clipboard fails.
   */
  onCopyFailure?: () => void
}

enum CopyStatus {
  Idle,
  Success,
  Error,
}

/**
 * A button that copies its `text` prop to the clipboard.
 * Provides visual feedback based on the success or failure of the copy action.
 */
export const CopyButton: FC<CopyButtonProps> = ({
  copyText,
  successLabel = 'Copied!',
  errorLabel = 'Error',
  icon = <BiCopy className="w-[24px] h-[24px] rotate-180" />,
  onCopyFailure = () => {},
  onCopySuccess = () => {},
  className,
  children,
  ...props
}) => {
  const ref = useRef<HTMLDivElement>(null)
  const [minWidth, setMinWidth] = useState<number>()
  const [status, setStatus] = useState<CopyStatus>(CopyStatus.Idle)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(copyText)
      setStatus(CopyStatus.Success)
      onCopySuccess()
    } catch (error) {
      console.error(error instanceof Error ? error.message : 'Cannot copy contents to the clipboard')
      setStatus(CopyStatus.Error)
      onCopyFailure()
    }
  }

  // Effect to set the minimum width based on the component's width in Idle state
  useEffect(() => {
    if (status !== CopyStatus.Idle || !ref.current) return
    setMinWidth(ref.current.getBoundingClientRect().width)
  }, [status])

  // Reset the button state back to idle after a timeout
  useEffect(() => {
    if (status === CopyStatus.Idle) return
    const timeOut = setTimeout(() => setStatus(CopyStatus.Idle), 3000)
    return () => clearTimeout(timeOut)
  }, [status])

  // Determine the text and classes based on the current status
  const { content, className: statusClasses } = {
    [CopyStatus.Success]: { content: successLabel, className: 'text-st-success' },
    [CopyStatus.Error]: { content: errorLabel, className: 'text-st-error' },
    [CopyStatus.Idle]: { content: children ?? copyText, className: 'cursor-pointer' },
  }[status]

  return (
    <div
      {...props}
      ref={ref}
      className={cn('flex gap-2 items-center justify-end font-normal', className, statusClasses)}
      style={{ minWidth }}
      onClick={copyToClipboard}
    >
      {content}
      {icon}
    </div>
  )
}
