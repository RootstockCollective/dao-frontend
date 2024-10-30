import { MdError } from 'react-icons/md'
import { HeaderTitle, Paragraph } from '@/components/Typography'

interface ErrorMessageAlertProps {
  title?: string
  message?: string
}
export const ErrorMessageAlert = ({
  title = 'Sorry!',
  message = 'An error occurred. Please try again shortly.',
}: ErrorMessageAlertProps) => (
  <div className="flex justify-cente items-center flex-col">
    <MdError size={128} color="var(--st-info)" />
    <HeaderTitle>{title}</HeaderTitle>
    <Paragraph>{message}</Paragraph>
  </div>
)
