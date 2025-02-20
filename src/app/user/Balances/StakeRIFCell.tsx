import { useBalancesContext } from '@/app/user/Balances/context/BalancesContext'
import { Button } from '@/components/Button'
import { ModalReturn } from '@/shared/hooks/useModal'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Props {
  stakeModal: ModalReturn
}

export const StakeRIFCell = ({ stakeModal }: Props) => {
  const { balances } = useBalancesContext()
  const { balance } = balances['RIF']
  const hasEnoughBalance = Number(balance) > 0

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
