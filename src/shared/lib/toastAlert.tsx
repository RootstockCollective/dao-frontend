import { Paragraph } from '@/components/Typography'
import { Bounce, toast } from 'react-toastify'

interface ToastAlertProps {
  severity: 'error' | 'success' | 'info' | 'warning'
  title: string
  content: string | React.ReactNode
  dismissible?: boolean
  dataTestId?: string
}

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
    {
      type: severity,
      position: 'top-right',
      autoClose: dismissible ? 5000 : false,
      hideProgressBar: !dismissible,
      closeOnClick: dismissible,
      closeButton: dismissible,
      pauseOnHover: false,
      theme: 'dark',
      transition: Bounce,
    },
  )

export const dismissToastAlerts = () => toast.dismiss()
