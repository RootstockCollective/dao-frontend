import { Button } from '@/components/ButtonNew'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { Modal } from '@/components/Modal'
import { Header, Label, Paragraph, Span } from '@/components/TypographyNew'
import { formatNumberWithCommas, shortAddress } from '@/lib/utils'
import { Address } from 'viem'

interface Props {
  onClose: () => void
  onDelegate: (address: Address) => void
  amount: number
  address: Address
  name?: string
  since?: string
  isLoading?: boolean
}

export const DelegateModal = ({
  onClose,
  onDelegate,
  amount,
  address,
  name,
  since = 'new delegate',
  isLoading = false,
}: Props) => {
  return (
    <Modal
      onClose={onClose}
      width={456}
      className="bg-text-80"
      data-testid="delegate-modal"
      closeButtonColor="black"
    >
      <div className="flex flex-col gap-2 items-center py-4 px-8">
        <Paragraph className="pr-8 text-bg-100">
          You are about to delegate your own voting power of {formatNumberWithCommas(amount)} to
        </Paragraph>
        {name ? (
          <>
            <div className="rounded-full bg-text-100">
              <Jdenticon value={address} size="88" />
            </div>
            <div className="flex flex-col items-center">
              <Paragraph className="text-bg-100">{name}</Paragraph>
              <Paragraph className="text-bg-40" variant="body-xs">
                {since}
              </Paragraph>
            </div>
          </>
        ) : (
          <>
            <Header className="text-bg-100" variant="h2">
              {shortAddress(address)}
            </Header>
            <Paragraph className="text-bg-40" variant="body-xs">
              {since}
            </Paragraph>
          </>
        )}
        <div className="flex flex-row gap-2 justify-end w-full mt-6">
          <Button variant="secondary-outline" onClick={onClose}>
            <Span className="text-bg-100">Cancel</Span>
          </Button>
          <Button
            variant="primary"
            onClick={() => onDelegate(address)}
            disabled={isLoading}
            className="disabled:bg-disabled-border"
          >
            {isLoading ? 'Delegating...' : 'Delegate'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
