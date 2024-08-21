import { BsExclamationCircle } from 'react-icons/bs'
import { CiCircleCheck } from 'react-icons/ci'
import { Paragraph } from '@/components/Typography'
import { MdClose } from 'react-icons/md'

export interface AlertProps {
  severity: 'error' | 'success' | 'info' | 'warning'
  title: string
  content: string
  onDismiss?: () => void
}

const IconToUse = {
  error: <BsExclamationCircle size={20} color="rgba(217,45,32,1)" />,
  info: <BsExclamationCircle size={20} color="cyan" />,
  success: <CiCircleCheck size={20} color="rgba(7,148,85,1)" />,
  warning: <BsExclamationCircle size={20} color="rgba(255,193,7,1)" />,
}

export const Alert = ({ severity, title, content, onDismiss }: AlertProps) => {
  return (
    <div className="relative flex border-gray-300 border p-[16px] rounded-[12px] gap-[16px] bg-input-bg mb-4 ml-4">
      {/* Icon */}
      {IconToUse[severity]}
      {/* Main content */}
      <div className="flex-1">
        <Paragraph className="leading-5 mb-[6px] text-[16px]">{title}</Paragraph>
        <Paragraph variant="light" className="font-[600] text-[14px] text-white opacity-80 mb-[12px]">
          {content}
        </Paragraph>
        {onDismiss && (
          <div onClick={onDismiss} className="cursor-pointer">
            <Paragraph variant="light" className="text-[14px]">
              Dismiss
            </Paragraph>
          </div>
        )}
      </div>
      {/* X */}
      {onDismiss && <MdClose size={20} className="cursor-pointer" onClick={onDismiss} />}
    </div>
  )
}
