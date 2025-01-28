import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { Button } from '@/components/Button'
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
    <Button
      onClick={hasEnoughBalance ? stakeModal.openModal : undefined}
      disabled={!hasEnoughBalance}
      buttonProps={{ style: { width: '93px' } }}
      data-testid="StakeRIF"
    >
      Stake
    </Button>
  )
}
