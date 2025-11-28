'use client'

import { Button } from '@/components/Button'
import { VaultMetrics } from './components/VaultMetrics'
import { StrategiesInfo } from './components/StrategiesInfo'
import { SupplyModal } from './components/SupplyModal'
import { WithdrawModal } from './components/WithdrawModal'
import { VaultDisclaimer } from './components/VaultDisclaimer'
import { useModal } from '@/shared/hooks/useModal'
import { Span } from '@/components/Typography'
import { SwappingFlow } from '@/app/user/Swap'

const NAME = 'USD Vault'

export const VaultPage = () => {
  const supplyModal = useModal()
  const withdrawModal = useModal()
  const swapModal = useModal()

  return (
    <div
      data-testid={NAME}
      className="flex flex-col items-start w-full h-full pt-[0.13rem] md:gap-6 rounded-sm"
    >
      <div data-testid="vault-content" className="flex flex-col w-full items-start gap-6">
        <VaultDisclaimer />
        <VaultMetrics />

        <StrategiesInfo />

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-start w-full">
          <Button variant="primary" onClick={supplyModal.openModal} data-testid="supply-button">
            Deposit
          </Button>
          <Button variant="secondary-outline" onClick={withdrawModal.openModal} data-testid="withdraw-button">
            Withdraw
          </Button>
          <Button
            variant="secondary-outline"
            onClick={swapModal.openModal}
            data-testid="swap-button"
            className="md:max-w-28 md:max-h-13"
          >
            <Span variant="body-s">{'USDT0 -> USDRIF'}</Span>
          </Button>
        </div>
      </div>

      {supplyModal.isModalOpened && <SupplyModal onCloseModal={supplyModal.closeModal} />}
      {withdrawModal.isModalOpened && <WithdrawModal onCloseModal={withdrawModal.closeModal} />}
      {swapModal.isModalOpened && <SwappingFlow onCloseModal={swapModal.closeModal} />}
    </div>
  )
}
