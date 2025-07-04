import { Button } from '@/components/ButtonNew'
import { Jdenticon } from '@/components/Header/Jdenticon'
import { Modal } from '@/components/Modal'
import { Header, Paragraph, Span } from '@/components/TypographyNew'
import { shortAddress } from '@/lib/utils'
import { Address } from 'viem'

interface Props {
  onClose: () => void
  onDelegate: (address: Address) => void
  title: string
  address: Address
  name?: string
  since?: string
  isLoading?: boolean
  actionButtonText: string
  'data-testid'?: string
}

export const DelegateModal = ({
  onClose,
  onDelegate,
  title,
  address,
  name,
  since = 'new delegate',
  isLoading = false,
  actionButtonText,
  'data-testid': dataTestId = '',
}: Props) => {
  return (
    <Modal
      onClose={onClose}
      width={456}
      className="bg-text-80"
      closeButtonColor="black"
      data-testid={dataTestId}
    >
      <div className="flex flex-col gap-2 items-center py-4 px-8">
        <Paragraph className="pr-8 text-bg-100">{title}</Paragraph>
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
            {actionButtonText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
