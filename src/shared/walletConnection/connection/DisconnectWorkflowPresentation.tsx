import { Popover } from '@/components/Popover'
import { DisconnectButton } from '@/shared/walletConnection'
import { AccountAddress } from '@/components/Header'
import { DisconnectWalletModal } from '@/components/Modal/DisconnectWalletModal'

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
  return (
    <>
      <Popover
        contentContainerClassName="w-[233px] max-w-[calc(100vw-1rem)] right-0"
        contentSubContainerClassName="w-full p-[24px] text-center rounded border-[#2D2D2D] cursor-pointer select-none bg-bg-60 mt-2"
        contentSubcontainerProps={{ onClick: onOpenModal }}
        content={<DisconnectButton />}
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
