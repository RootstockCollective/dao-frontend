import { Button } from '@/components/Button'
import { IpfsAvatar } from '@/components/IpfsAvatar'
import { Modal } from '@/components/Modal'
import { Header, Paragraph } from '@/components/Typography'
import { shortAddress } from '@/lib/utils'
import { Address } from 'viem'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

interface Props {
  onClose: () => void
  onDelegate: (address: Address) => void
  title: string
  address: Address
  actionButtonText: string
  name?: string
  imageIpfs?: string | null
  since?: string
  isLoading?: boolean
  'data-testid'?: string
}

export const DelegateModal = ({
  onClose,
  onDelegate,
  title,
  address,
  name,
  imageIpfs,
  since = 'new delegate',
  isLoading = false,
  actionButtonText,
  'data-testid': dataTestId = '',
}: Props) => {
  const isDesktop = useIsDesktop()
  return (
    <Modal
      onClose={onClose}
      width={456}
      className="bg-text-80"
      closeButtonColor="black"
      data-testid={dataTestId}
      fullscreen={!isDesktop}
    >
      <div className="flex flex-col gap-2 items-center py-4 px-8">
        <Paragraph className="pr-8 text-bg-100 md:mt-4 mt-16">{title}</Paragraph>
        <div className="rounded-full bg-text-100 md:mt-4 mt-10">
          <IpfsAvatar imageIpfs={imageIpfs} address={address} name={name} size={88} />
        </div>
        <div className="flex flex-col items-center">
          {name ? (
            <Paragraph className="text-bg-100">{name}</Paragraph>
          ) : (
            <Header className="text-bg-100" variant="h2">
              {shortAddress(address)}
            </Header>
          )}
          <Paragraph className="text-bg-40" variant="body-xs">
            {since}
          </Paragraph>
        </div>
        <div
          className={`flex flex-row gap-3 justify-end md:w-full mt-6 ${!isDesktop ? 'fixed bottom-4 inset-x-4' : ''}`}
        >
          <Button
            variant="secondary-outline"
            onClick={onClose}
            data-testid="CancelButton"
            className="w-auto text-bg-100 py-3 px-4"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => onDelegate(address)}
            disabled={isLoading}
            className="disabled:bg-disabled-border md:flex-none flex-1"
            data-testid={`${actionButtonText}Button`}
          >
            {actionButtonText}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
