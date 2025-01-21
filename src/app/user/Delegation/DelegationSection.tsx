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
import { ReclaimCell } from './ReclaimCell'
import { DelegationAction } from './type'
import { useGetExternalDelegatedAmount } from '@/shared/hooks/useGetExternalDelegatedAmount'
import { TokenValue } from '@/app/user/Delegation/TokenValue'

export const DelegationSection = () => {
  const { address } = useAccount()
  const { delegateeAddress } = useGetDelegates(address)

  const [isDelegateModalOpened, setIsDelegateModalOpened] = useState(false)
  const [hash, setHash] = useState<Hash | undefined>(undefined)
  const [action, setAction] = useState<DelegationAction>('delegation')

  const { setMessage: setGlobalMessage } = useAlertContext()

  const onDelegateTxStarted = (hash: string, action: DelegationAction = 'delegation') => {
    setHash(hash as Hash)
    setAction(action)
  }

  const { isSuccess, isError } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (isSuccess) {
      setGlobalMessage(TX_MESSAGES[action].success)
    }
    if (isError) {
      setGlobalMessage(TX_MESSAGES[action].error)
    }
  }, [action, isError, isSuccess, setGlobalMessage])

  const isValidDelegatee = delegateeAddress !== address
  const delegatee = {
    'Voting Power Delegated': isValidDelegatee ? <HolderColumn address={delegateeAddress || ''} /> : '-',
    Amount: isValidDelegatee ? <RenderTotalBalance symbol="stRIF" /> : '-',
    Actions: isValidDelegatee ? <ReclaimCell onDelegateTxStarted={onDelegateTxStarted} /> : '-',
  }

  const { amount: amountDelegatedToMe, isLoading: isExternalDelegatedAmountLoading } =
    useGetExternalDelegatedAmount(address)

  const delegatedToMe = {
    'Voting Power Received': <TokenValue symbol="stRIF" amount={amountDelegatedToMe} shouldFormatBalance />,
  }

  return (
    <div className="mb-6">
      {/* Header Components*/}
      <div className="flex flex-row justify-between mb-6">
        <HeaderTitle>DELEGATION</HeaderTitle>
        <Button variant="outlined" onClick={() => setIsDelegateModalOpened(true)} data-testid="Delegate">
          Delegate
        </Button>
      </div>
      <BalancesProvider>
        {!isExternalDelegatedAmountLoading && <Table data={[delegatedToMe]} />}
        <Table data={[delegatee]} />
      </BalancesProvider>
      {isDelegateModalOpened && (
        <DelegateModal
          onClose={() => setIsDelegateModalOpened(false)}
          onDelegateTxStarted={onDelegateTxStarted}
        />
      )}
    </div>
  )
}
