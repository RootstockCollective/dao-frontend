import { Paragraph } from '@/components/Typography'
import { ReactNode } from 'react'
import { Bounce, Id, toast, ToastOptions } from 'react-toastify'
import { TxStatus } from '../types'

interface ToastAlertData {
  title: string
  content: string | ReactNode
  loading?: boolean
  dataTestId?: string
}

export interface ToastAlertOptions extends ToastOptions {
  severity: TxStatus
  title: string
  content: string | ReactNode
  dismissible?: boolean
  loading?: boolean
  dataTestId?: string
}

/**
 * Displays a toast alert with the specified properties.
 *
 * @param {TxStatus} severity - The severity of the alert (e.g., 'error', 'success', 'info', 'warning').
 * @param {string} title - The title of the alert.
 * @param {string | ReactNode} content - The content of the alert (can be a string or a ReactNode).
 * @param {boolean} [dismissible=true] - Whether the alert is dismissible or not.
 * @param {string} [dataTestId=''] - The `data-testid` attribute for testing purposes.
 * @param {ToastAlertOptions} props - Additional properties for the toast alert.
 * @returns {Id} The ID of the created toast alert.
 */
export const showToast = ({
  severity,
  title,
  content,
  loading = false,
  dataTestId = severity,
  ...props
}: ToastAlertOptions): Id =>
  toast(
    buildToastContent({ title, content, dataTestId, loading }),
    buildToastProps({ severity, title, content, loading, ...props }),
  )

/**
 * Updates an existing toast alert with the specified properties.
 *
 * @param {Id} toastId - The ID of the toast alert to update.
 * @param {ToastAlertOptions} props - The properties to update the toast alert with.
 *
 * @example pending to success
 */
export const updateToast = (toastId: Id, props: ToastAlertOptions) => {
  const { title, content, dataTestId } = props
  return toast.update(toastId, {
    ...buildToastProps(props),
    render: buildToastContent({ title, content, dataTestId }),
  })
}

const buildToastProps = ({
  severity,
  title,
  content,
  toastId,
  dismissible = true,
  loading = false,
  ...props
}: ToastAlertOptions): ToastOptions => ({
  toastId: toastId || `${severity}-${title}-${content}`,
  type: severity,
  position: 'top-right',
  autoClose: dismissible ? (loading ? 120_000 : 10000) : false,
  hideProgressBar: dismissible || loading,
  isLoading: loading,
  closeButton: !dismissible,
  theme: 'dark',
  transition: Bounce,
  ...props,
})

const buildToastContent = ({ title, content, dataTestId }: ToastAlertData) => (
  <div className="flex items-start gap-2" data-testid={`Alert-${dataTestId}`}>
    <div>
      <Paragraph
        variant="bold"
        className="leading-5 mb-[6px] text-[18px] text-white"
        data-testid="ToastTitle"
      >
        {title}
      </Paragraph>
      {typeof content === 'string' ? (
        <Paragraph
          variant="light"
          className="font-[600] text-[14px] text-white opacity-80 mb-[12px] max-h-36 overflow-y-auto"
          data-testid="ToastContent"
        >
          {content}
        </Paragraph>
      ) : (
        content
      )}
    </div>
  </div>
)
