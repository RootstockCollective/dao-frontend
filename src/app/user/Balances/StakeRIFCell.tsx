import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { cn } from '@/lib/utils'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export const StakeRIFCell = () => {
  const searchParams = useSearchParams()
  const action = searchParams?.get('action')
  const [openModal, setOpenModal] = useState(action === 'stake')

  const { stakeModal, balances } = useBalancesContext()
  const { balance } = balances['RIF']
  const hasEnoughBalance = Number(balance) > 0

  useEffect(() => {
    if (openModal && hasEnoughBalance) {
      stakeModal.openModal()
      setOpenModal(false)
    }
  }, [openModal, hasEnoughBalance, stakeModal])

  return (
    <p
      onClick={hasEnoughBalance ? stakeModal.openModal : undefined}
      className={cn('', hasEnoughBalance ? 'text-primary cursor-pointer' : 'text-zinc-500')}
      data-testid={'StakeRIFParagraph'}
    >
      Stake
    </p>
  )
}
