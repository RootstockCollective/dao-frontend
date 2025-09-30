import { Popover } from '@/components/Popover'
import { DisconnectButton } from '@/shared/walletConnection'
import { AccountAddress } from '@/components/Header'
import { DisconnectWalletModal } from '@/components/Modal/DisconnectWalletModal'
import { CopyButton } from '@/components/CopyButton'
import { useAppKit } from '@reown/appkit/react'
import { Button } from '@/components/Button'

interface DisconnectWorkflowPresentationProps {
  shortAddress: string
  isModalOpened: boolean
  onOpenModal: () => void
  onCloseModal: () => void
  onDisconnect: () => void
  address?: string
}

/**
 * Presentational component for disconnect workflow UI
 * @constructor
 */
export const DisconnectWorkflowPresentation = ({
  address,
  shortAddress,
  isModalOpened,
  onOpenModal,
  onCloseModal,
  onDisconnect,
}: DisconnectWorkflowPresentationProps) => {
  const { open } = useAppKit()
  const openRamp = () => open({ view: 'OnRampProviders' })
  return (
    <>
      <Button variant="secondary-outline" onClick={openRamp} className="md:mr-4">
        On Ramp
      </Button>
      <Popover
        contentContainerClassName="w-[233px] max-w-[calc(100vw-1rem)] right-0"
        contentSubContainerClassName="w-full p-[24px] text-center rounded border-[#2D2D2D] cursor-pointer select-none bg-bg-60 mt-2 flex justify-center"
        className="flex items-center"
        content={
          <PopoverDisconnectContentContainer
            address={address ?? ''}
            shortAddress={shortAddress}
            onDisconnectClick={onOpenModal}
          />
        }
        trigger="click"
      >
        <AccountAddress address={address} shortAddress={shortAddress} withCopy={false} />
      </Popover>
      {isModalOpened && (
        <DisconnectWalletModal onClose={onCloseModal} onConfirm={onDisconnect} onCancel={onCloseModal} />
      )}
    </>
  )
}

interface PopoverDisconnectContainerProps {
  address: string
  shortAddress: string
  onDisconnectClick: () => void
}

/**
 * Container for disconnect popover content (when popover is opened)
 * @param address
 * @param shortAddress
 * @param onDisconnectClick
 * @constructor
 */
const PopoverDisconnectContentContainer = ({
  address,
  shortAddress,
  onDisconnectClick,
}: PopoverDisconnectContainerProps) => (
  <div className="flex flex-col gap-3">
    <CopyButton copyText={address} className="md:hidden">
      {shortAddress}
    </CopyButton>
    <DisconnectButton onClick={onDisconnectClick} />
  </div>
)
