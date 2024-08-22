import { FC, useState, useEffect, ReactNode, ReactElement, cloneElement } from 'react'
import { BiCopy } from 'react-icons/bi'
import { cn } from '@/lib/utils'

interface CopyButtonProps {
  /**
   * Text to be copied to the clipboard.
   */
  copyText: string
  /**
   * Component to display next to the button instead of plain text.
   */
  label?: ReactNode
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
  label,
  successLabel = 'Copied!',
  errorLabel = 'Error',
  icon = <BiCopy className="w-[24px] h-[24px] rotate-180" />,
  onCopyFailure = () => {},
  onCopySuccess = () => {},
}) => {
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

  // Reset the button state back to idle after a timeout
  useEffect(() => {
    if (status === CopyStatus.Idle) return
    const timeOut = setTimeout(() => setStatus(CopyStatus.Idle), 3000)
    return () => clearTimeout(timeOut)
  }, [status])

  // button text and classes for different status values
  const { text: statusText, className: statusClasses } = {
    [CopyStatus.Success]: { text: successLabel, className: 'text-st-success' },
    [CopyStatus.Error]: { text: errorLabel, className: 'text-st-error' },
    [CopyStatus.Idle]: { text: label ?? copyText, className: '' },
  }[status]

  return (
    <div className="flex gap-2 items-center justify-end cursor-pointer font-normal" onClick={copyToClipboard}>
      <span className={statusClasses}>{statusText}</span>
      {icon && cloneElement(icon, { className: cn(icon.props.className, statusClasses) })}
    </div>
  )
}
