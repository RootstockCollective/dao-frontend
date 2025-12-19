'use client'

import { useRef, useState } from 'react'
import { useAccount } from 'wagmi'
import { Button } from '@/components/Button'
import { NewPopover } from '@/components/NewPopover'
import { Span } from '@/components/Typography'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { useAppKitFlow } from '@/shared/walletConnection/connection/useAppKitFlow'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'
import { ConnectButtonComponent } from '@/shared/walletConnection/components/ConnectButtonComponent'
import { useModal } from '@/shared/hooks/useModal'
import { DepositModal } from './DepositModal'
import { WithdrawModal } from './WithdrawModal'
import { MoneyIconKoto } from '@/components/Icons'

/**
 * Component providing deposit and withdraw actions for the vault
 *
 * Features:
 * - Deposit button: Opens DepositModal when wallet is connected, or prompts wallet connection
 * - Withdraw button: Opens WithdrawModal when wallet is connected, or prompts wallet connection
 * - Wallet connection handling:
 *   - On mobile: Directly triggers wallet connection flow
 *   - On desktop: Shows a popover with wallet connection options
 * - Manages modal state for both deposit and withdraw operations
 *
 * @returns Deposit and withdraw buttons with associated modals and connection popovers
 */
export const VaultActions = () => {
  const { isConnected } = useAccount()
  const { onConnectWalletButtonClick } = useAppKitFlow()
  const isDesktop = useIsDesktop()
  const depositModal = useModal()
  const withdrawModal = useModal()
  const [depositPopoverOpen, setDepositPopoverOpen] = useState(false)
  const [withdrawPopoverOpen, setWithdrawPopoverOpen] = useState(false)
  const depositButtonRef = useRef<HTMLButtonElement>(null)
  const withdrawButtonRef = useRef<HTMLButtonElement>(null)

  const handleDepositClick = () => {
    if (!isConnected) {
      if (!isDesktop) {
        onConnectWalletButtonClick()
        return
      }
      setDepositPopoverOpen(true)
      return
    }

    depositModal.openModal()
  }

  const handleWithdrawClick = () => {
    if (!isConnected) {
      if (!isDesktop) {
        onConnectWalletButtonClick()
        return
      }
      setWithdrawPopoverOpen(true)
      return
    }
    withdrawModal.openModal()
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-start w-full">
        <NewPopover
          open={depositPopoverOpen}
          onOpenChange={setDepositPopoverOpen}
          anchorRef={depositButtonRef}
          className="bg-text-80 rounded-[4px] border border-text-80 p-6 shadow-lg w-72"
          contentClassName="flex flex-col items-start bg-transparent h-full"
          content={
            <>
              <Span className="mb-4 text-left text-bg-100">Connect your wallet to deposit funds.</Span>
              <ConnectWorkflow
                ConnectComponent={props => <ConnectButtonComponent {...props} textClassName="text-bg-100" />}
              />
            </>
          }
        />
        <Button
          variant="secondary-outline"
          onClick={handleDepositClick}
          data-testid="deposit-button"
          ref={depositButtonRef}
          className="flex flex-row gap-2 justify-center"
        >
          <Span className="flex-shrink-0">Deposit</Span>
          <MoneyIconKoto style={{ transform: 'rotate(180deg)' }} />
        </Button>
        <NewPopover
          open={withdrawPopoverOpen}
          onOpenChange={setWithdrawPopoverOpen}
          anchorRef={withdrawButtonRef}
          className="bg-text-80 rounded-[4px] border border-text-80 p-6 shadow-lg w-72"
          contentClassName="flex flex-col items-start bg-transparent h-full"
          content={
            <>
              <Span className="mb-4 text-left text-bg-100">Connect your wallet to withdraw funds.</Span>
              <ConnectWorkflow
                ConnectComponent={props => <ConnectButtonComponent {...props} textClassName="text-bg-100" />}
              />
            </>
          }
        />
        <Button
          variant="transparent"
          onClick={handleWithdrawClick}
          data-testid="withdraw-button"
          ref={withdrawButtonRef}
          className="flex flex-row gap-2 pl-0 justify-start"
        >
          <Span className="flex-shrink-0">Withdraw</Span>
          <MoneyIconKoto />
        </Button>
      </div>

      {depositModal.isModalOpened && <DepositModal onCloseModal={depositModal.closeModal} />}
      {withdrawModal.isModalOpened && <WithdrawModal onCloseModal={withdrawModal.closeModal} />}
    </div>
  )
}
