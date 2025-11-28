import { Button } from '@/components/Button'
import { Paragraph, Span } from '@/components/Typography'
import { useRouter } from 'next/navigation'

interface Props {
  hasFunds: boolean
  isConnected: boolean
}

export const BackingInfoTitle = ({ hasFunds, isConnected }: Props) => {
  const router = useRouter()
  return (
    <div className="flex flex-col md:flex-row items-start justify-between gap-4">
      <Paragraph variant="body">
        {isConnected && <Span bold>You are not backing any Builders yet. </Span>}
        Use your stRIF backing power to support the Builders you believe in.
      </Paragraph>

      {isConnected && hasFunds && (
        <Button
          variant="primary"
          className="shrink-0 w-auto md:self-center"
          onClick={() => router.push('/builders')}
        >
          See all Builders
        </Button>
      )}
    </div>
  )
}
