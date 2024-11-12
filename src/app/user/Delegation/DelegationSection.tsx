'use client'
import { HolderColumn } from '@/app/communities/HolderColumn'
import { Table } from '@/components/Table'
import { Button } from '@/components/Button'
import { DelegateModal } from '@/app/user/Delegation/DelegateModal'
import { useEffect, useState } from 'react'
import { useWaitForTransactionReceipt } from 'wagmi'
import { Hash } from 'viem'
import { useAlertContext } from '@/app/providers'
import { TX_MESSAGES } from '@/shared/txMessages'
import { HeaderTitle } from '@/components/Typography'
import { useAccount } from 'wagmi'
import { RenderTotalBalance } from '../Balances/RenderTotalBalance'
import { BalancesProvider } from '../Balances/context/BalancesContext'
import { useGetDelegates } from './hooks/useGetDelegates'

export const DelegationSection = () => {
  const { address } = useAccount()
  const { delegateeAddress } = useGetDelegates(address)

  const [isDelegateModalOpened, setIsDelegateModalOpened] = useState(false)
  const [hash, setHash] = useState<Hash | undefined>(undefined)

  const { setMessage: setGlobalMessage } = useAlertContext()

  const onDelegateTxStarted = (hash: string) => {
    setHash(hash as Hash)
  }

  const { isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    console.log(24, { isSuccess })
    if (isSuccess) {
      setGlobalMessage(TX_MESSAGES.delegation.success)
    }
  }, [isSuccess, setGlobalMessage])
  
  if (!delegateeAddress || delegateeAddress === address) {
    return null
  }

  const delegatee = {
    'Voting Power Delegated': <HolderColumn address={delegateeAddress} />,
    Amount: <RenderTotalBalance symbol="stRIF" />,
  }
  return (
    <>
      {/* Header Components*/}
      <div className="flex flex-row justify-between">
        <HeaderTitle>DELEGATION</HeaderTitle>
        <Button onClick={() => setIsDelegateModalOpened(true)}>Delegate</Button>
      </div>
      <BalancesProvider>
        <Table data={[delegatee]} />
      </BalancesProvider>
      {isDelegateModalOpened && (
        <DelegateModal
          onClose={() => setIsDelegateModalOpened(false)}
          onDelegateTxStarted={onDelegateTxStarted}
        />
      )}
    </>
  )
}
