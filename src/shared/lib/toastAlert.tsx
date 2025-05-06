import { Paragraph } from '@/components/Typography'
import { ReactNode } from 'react'
import { Bounce, Id, toast, ToastOptions } from 'react-toastify'

interface ToastAlertProps {
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
  dismissible = false,
}: ToastAlertProps): ToastOptions => ({
  toastId: `${severity}-${title}-${content}`,
  type: severity,
  position: 'top-right',
  autoClose: dismissible ? 5000 : false,
  hideProgressBar: !dismissible,
  closeOnClick: dismissible,
  closeButton: dismissible,
  pauseOnHover: false,
  theme: 'dark',
  transition: Bounce,
})

/**
 * This function is used to show a toast alert with the given properties
 * @param severity - The severity of the alert (error, success, info, warning)
 * @param title - The title of the alert
 * @param content - The content of the alert (can be a string or a ReactNode)
 * @param dismissible - Whether the alert is dismissible or not (default: false)
 * @param dataTestId - The data-testid attribute for testing purposes (default: '')
 */
export const showToastAlert = ({
  severity,
  title,
  content,
  dismissible = false,
  dataTestId = '',
}: ToastAlertProps) =>
  toast(
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
    </div>,
    buildToastProps({
      severity,
      title,
      content,
      dismissible,
    }),
  )

/**
 * This function is used to update a toast alert with the given properties
 * @param toastId - The ID of the toast alert to update
 * @param props - The optional properties to update the toast alert with
 */
export const updateToastAlert = (toastId: Id, props: Partial<ToastAlertProps>) =>
  toast.update(toastId, buildToastProps({ ...props } as ToastAlertProps))

/**
 * This function is used to dismiss all toast alerts
 */
export const dismissToastAlerts = () => toast.dismiss()
