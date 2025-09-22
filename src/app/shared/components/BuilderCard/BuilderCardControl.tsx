import { useAllocateVotes } from '@/app/collective-rewards/allocations/hooks/useAllocateVotes'
import { TokenRewards } from '@/app/collective-rewards/rewards'
import { Builder } from '@/app/collective-rewards/types'
import { TransactionInProgressButton } from '@/app/user/Stake/components/TransactionInProgressButton'
import { Button } from '@/components/Button'
import { useLayoutContext } from '@/components/MainContainer/LayoutProvider'
import { ActionsContainer } from '@/components/containers/ActionsContainer'
import { usePricesContext } from '@/shared/context'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { FC, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useBackingContext } from '../../context/BackingContext'
import { BuilderCard } from './BuilderCard'

export interface BuilderCardControlProps {
  builder: Builder
  estimatedRewards?: TokenRewards
  isInteractive?: boolean
  index?: number
  showAnimation?: boolean
}

// TODO: this component should really create its own context and stop prop drilling
const AllocationDrawerContent = () => {
  const { saveAllocations, isPendingTx, isLoadingReceipt, isSuccess } = useAllocateVotes()

  const { closeDrawer } = useLayoutContext()
  const { invalidateQueries } = useQueryClient()

  const onSaveAllocations = () => {
    saveAllocations()
  }
  const onCancelAllocations = () => {
    invalidateQueries()
    closeDrawer()
  }

  useEffect(() => {
    if (isSuccess) {
      closeDrawer()
    }
  }, [isSuccess, closeDrawer])

  return (
    <ActionsContainer className="bg-v3-bg-accent-60">
      <div className="flex justify-center gap-2 w-full">
        <Button variant="secondary-outline" onClick={onCancelAllocations}>
          Cancel
        </Button>
        {isPendingTx || isLoadingReceipt ? (
          <TransactionInProgressButton />
        ) : (
          <Button variant="primary" onClick={onSaveAllocations}>
            Save new backing amounts
          </Button>
        )}
      </div>
    </ActionsContainer>
  )
}

export const BuilderCardControl: FC<BuilderCardControlProps> = ({
  builder,
  index,
  showAnimation = false,
  ...props
}) => {
  const { isConnected } = useAccount()
  const { prices } = usePricesContext()
  const { openDrawer, closeDrawer } = useLayoutContext()
  const router = useRouter()

  const { balance } = useBackingContext()

  useEffect(() => {
    if (!isConnected) return

    if (balance.onchain !== balance.pending) {
      openDrawer(<AllocationDrawerContent />, true)
    } else {
      closeDrawer()
    }
  }, [balance, isConnected])

  return (
    <div key={builder.address} className="max-sm:flex-shrink-0 max-sm:snap-center max-sm:w-64 flex w-full">
      <BuilderCard
        {...props}
        builder={builder}
        index={index}
        showAnimation={showAnimation}
        onConnect={() => router.push(`/backing?builders=${builder.address}`) /* 🤢 */}
        allocationInputProps={{
          builderAddress: builder.address,
          allocationTxPending: false, // TODO: this is not currently used on main
          disabled: false,
          prices,
        }}
      />
    </div>
  )
}
