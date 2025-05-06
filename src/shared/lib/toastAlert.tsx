import { Paragraph } from '@/components/Typography'
import { ReactNode } from 'react'
import { Bounce, Id, toast, ToastOptions } from 'react-toastify'

interface ToastAlertData {
  title: string
  content: string | ReactNode
  dataTestId?: string
}

export interface ToastAlertOptions extends ToastOptions {
  severity: 'error' | 'success' | 'info' | 'warning'
  title: string
  content: string | ReactNode
  dismissible?: boolean
  dataTestId?: string
}

const buildToastProps = ({
  severity,
  title,
  content,
  toastId,
  dismissible = true,
  ...props
}: ToastAlertOptions): ToastOptions => ({
  toastId: toastId || `${severity}-${title}-${content}`,
  type: severity,
  position: 'top-right',
  autoClose: dismissible && 10000,
  hideProgressBar: !dismissible,
  closeButton: dismissible,
  theme: 'dark',
  transition: Bounce,
  ...props,
})

const buildToastData = ({ title, content, dataTestId }: ToastAlertData) => (
  <div className="flex items-start gap-2" data-testid={`Alert${dataTestId}`}>
    <div>
      <Paragraph
        variant="bold"
        className="leading-5 mb-[6px] text-[18px] text-white"
        data-testid="AlertTitle"
      >
        {title}
      </Paragraph>
      {typeof content === 'string' ? (
        <Paragraph
          variant="light"
          className="font-[600] text-[14px] text-white opacity-80 mb-[12px] max-h-36 overflow-y-auto"
          data-testid="AlertContent"
        >
          {content}
        </Paragraph>
      ) : (
        content
      )}
    </div>
  </div>
)

/**
 * This function is used to show a toast alert with the given properties
 * @param severity - The severity of the alert (error, success, info, warning)
 * @param title - The title of the alert
 * @param content - The content of the alert (can be a string or a ReactNode)
 * @param dismissible - Whether the alert is dismissible or not (default: false)
 * @param dataTestId - The data-testid attribute for testing purposes (default: '')
 * @param props - Additional properties for the toast alert
 * @returns The ID of the created toast alert
 */
export const showToastAlert = ({
  severity,
  title,
  content,
  dismissible = false,
  dataTestId = '',
  ...props
}: ToastAlertOptions) =>
  toast(
    buildToastData({ title, content, dataTestId }),
    buildToastProps({
      severity,
      title,
      content,
      dismissible,
      ...props,
    }),
  )

/**
 * This function is used to update a toast alert with the given properties
 * @param toastId - The ID of the toast alert to update
 * @param props - The properties to update the toast alert with
 */
export const updateToastAlert = (toastId: Id, props: ToastAlertOptions) => {
  return toast.update(toastId, {
    ...buildToastProps(props as ToastAlertOptions),
    render: buildToastData({
      title: props.title,
      content: props.content,
      dataTestId: props.dataTestId,
    }),
  })
}
