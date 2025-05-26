import { Paragraph } from '@/components/Typography'
import { ReactNode } from 'react'
import { Bounce, Id, toast, ToastOptions } from 'react-toastify'
import { TxStatus } from '../types'
import { EXPLORER_URL } from '@/lib/constants'
import { Link } from '@/components/Link'

interface ToastAlertContent {
  title: string
  content: string | ReactNode
  txHash?: string
  loading?: boolean
  dataTestId?: string
}

export interface ToastAlertOptions extends ToastOptions {
  severity: TxStatus | 'warning'
  title: string
  content: string | ReactNode
  dismissible?: boolean
  loading?: boolean
  txHash?: string
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
  txHash,
  loading = false,
  dataTestId = severity,
  ...props
}: ToastAlertOptions): Id =>
  toast(
    buildToastContent({ title, content, txHash, loading, dataTestId }),
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
  const { title, content, txHash, dataTestId } = props
  return toast.update(toastId, {
    ...buildToastProps(props),
    render: buildToastContent({ title, content, txHash, dataTestId }),
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
  toastId: toastId || `${severity}-${title}-${Date.now()}`,
  type: severity,
  position: 'top-right',
  // 2 minutes for loading toasts to prevent them from getting stuck indefinitely
  autoClose: dismissible ? (loading ? 120_000 : 10_000) : false,
  hideProgressBar: !dismissible || loading,
  isLoading: loading,
  closeButton: dismissible,
  theme: 'dark',
  transition: Bounce,
  ...props,
})

const buildToastContent = ({ title, content, txHash, dataTestId }: ToastAlertContent) => (
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
      {txHash && (
        <Link
          href={`${EXPLORER_URL}/tx/${txHash}`}
          target="_blank"
          className="text-blue-500 underline block"
          data-testid="ToastExplorerLink"
        >
          View on Explorer
        </Link>
      )}
    </div>
  </div>
)
