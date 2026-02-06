'use client'

import { useCallback, useRef, useState } from 'react'
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
import { SwappingFlow } from '@/app/user/Swap'
import { useVaultBalance } from '../hooks/useVaultBalance'
import { useGetAddressBalances } from '@/app/user/Balances/hooks/useGetAddressBalances'

/**
 * Component providing deposit and withdraw actions for the vault
 *
 * Features:
 * - Deposit button: Opens DepositModal when wallet is connected, or prompts wallet connection
 * - Withdraw button: Opens WithdrawModal when wallet is connected, or prompts wallet connection
 * - Swap button: Opens SwappingFlow when wallet is connected, or prompts wallet connection
 * - Wallet connection handling:
 *   - On mobile: Directly triggers wallet connection flow
 *   - On desktop: Shows a popover with wallet connection options
 * - Manages modal state for deposit, withdraw, and swap operations
 *
 * @returns Deposit and withdraw buttons with associated modals and connection popovers
 */
export const VaultActions = () => {
  const { isConnected } = useAccount()
  const { onConnectWalletButtonClick } = useAppKitFlow()
  const isDesktop = useIsDesktop()

  // Refetch functions for balance updates after transactions
  const { refetch: refetchVaultBalance } = useVaultBalance()
  const { refetchBalances } = useGetAddressBalances()

  const handleRefreshBalances = useCallback(() => {
    refetchVaultBalance()
    refetchBalances()
  }, [refetchVaultBalance, refetchBalances])

  // Modal states
  const depositModal = useModal()
  const withdrawModal = useModal()
  const swapModal = useModal()

  const [depositPopoverOpen, setDepositPopoverOpen] = useState(false)
  const [withdrawPopoverOpen, setWithdrawPopoverOpen] = useState(false)
  const [swapPopoverOpen, setSwapPopoverOpen] = useState(false)
  const depositButtonRef = useRef<HTMLButtonElement>(null)
  const withdrawButtonRef = useRef<HTMLButtonElement>(null)
  const swapButtonRef = useRef<HTMLButtonElement>(null)

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

  const handleSwapClick = () => {
    if (!isConnected) {
      if (!isDesktop) {
        onConnectWalletButtonClick()
        return
      }
      setSwapPopoverOpen(true)
      return
    }
    swapModal.openModal()
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-start w-full">
        {/* Primary action: Deposit */}
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
          variant="primary"
          onClick={handleDepositClick}
          data-testid="deposit-button"
          ref={depositButtonRef}
        >
          Deposit
        </Button>

        {/* Secondary action: Swap */}
        <NewPopover
          open={swapPopoverOpen}
          onOpenChange={setSwapPopoverOpen}
          anchorRef={swapButtonRef}
          className="bg-text-80 rounded-[4px] border border-text-80 p-6 shadow-lg w-72"
          contentClassName="flex flex-col items-start bg-transparent h-full"
          content={
            <>
              <Span className="mb-4 text-left text-bg-100">Connect your wallet to swap tokens.</Span>
              <ConnectWorkflow
                ConnectComponent={props => <ConnectButtonComponent {...props} textClassName="text-bg-100" />}
              />
            </>
          }
        />
        <Button
          variant="secondary-outline"
          onClick={handleSwapClick}
          data-testid="vault-swap-button"
          ref={swapButtonRef}
        >
          USDT0 to USDRIF
        </Button>

        {/* Tertiary action: Withdraw (ghost) */}
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

      {depositModal.isModalOpened && (
        <DepositModal onCloseModal={depositModal.closeModal} onTransactionSuccess={handleRefreshBalances} />
      )}
      {withdrawModal.isModalOpened && (
        <WithdrawModal onCloseModal={withdrawModal.closeModal} onTransactionSuccess={handleRefreshBalances} />
      )}
      {swapModal.isModalOpened && <SwappingFlow onCloseModal={swapModal.closeModal} />}
    </div>
  )
}
