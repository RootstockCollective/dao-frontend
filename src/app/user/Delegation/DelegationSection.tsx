'use client'
import { HolderColumn } from '@/app/communities/nft/[address]/_components/HolderColumn'
import { Table } from '@/components/Table'
import { Button } from '@/components/Button'
import { DelegateModal } from '@/app/user/Delegation/DelegateModal'
import { useEffect, useState } from 'react'
import { useWaitForTransactionReceipt } from 'wagmi'
import { Hash } from 'viem'
import { useAlertContext } from '@/app/providers'
import { TX_MESSAGES } from '@/shared/txMessages'
import { HeaderTitle, Paragraph } from '@/components/Typography'
import { useAccount } from 'wagmi'
import { RenderTotalBalance } from '../Balances/RenderTotalBalance'
import { useGetDelegates } from './hooks/useGetDelegates'
import { ReclaimCell } from './ReclaimCell'
import { DelegationAction } from './type'
import { useGetExternalDelegatedAmount } from '@/shared/hooks/useGetExternalDelegatedAmount'
import { TokenValue } from '@/app/user/Delegation/TokenValue'
import { Popover } from '@/components/Popover'
import Image from 'next/image'
import { formatUnits } from 'ethers'
import { ConnectWorkflow } from '@/shared/walletConnection/connection/ConnectWorkflow'
import { QuestionIcon } from '@/components/Icons'

export const DelegationSection = () => {
  const { address, isConnected } = useAccount()
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
    Amount: isValidDelegatee ? <RenderTotalBalance symbol="stRIF" context="VotingPower" /> : '-',
    Actions: isValidDelegatee ? <ReclaimCell onDelegateTxStarted={onDelegateTxStarted} /> : '-',
  }

  const { amount: amountDelegatedToMe, isLoading: isExternalDelegatedAmountLoading } =
    useGetExternalDelegatedAmount(address)

  const delegatedToMe = {
    'Voting Power Received': <TokenValue symbol="stRIF" amount={formatUnits(amountDelegatedToMe)} />,
  }

  const handleDelegateClick = () => {
    if (!isConnected) {
      return // ConnectWorkflow will handle the connection
    }
    setIsDelegateModalOpened(true)
  }

  if (!isConnected) {
    return (
      <div className="mb-6 flex flex-col items-center" data-testid="DelegationSection">
        <div className="text-center mt-10 mb-8">
          <HeaderTitle className="mb-4 font-kk-topo">DELEGATION</HeaderTitle>
          <Paragraph className="mb-6">
            Delegation allows you to assign your voting power to another community member you trust.
            <br />
            You remain the owner of your staked RIF.
          </Paragraph>
          <div className="flex justify-center">
            <ConnectWorkflow
              ConnectComponent={({ onClick }) => (
                <Button
                  variant="white-new"
                  onClick={onClick}
                  data-testid="Delegate"
                  className="h-[40px]"
                  textClassName="text-black"
                >
                  Delegate
                </Button>
              )}
            />
          </div>
        </div>

        <div className="max-w-xl mt-10">
          <div className="flex items-start mb-4">
            <div className="mr-2 mt-1">
              <span className="inline-block w-5 h-5 text-center rounded-sm">✅</span>
            </div>
            <div>
              <Paragraph className="font-bold">Delegate your voting power</Paragraph>
              <Paragraph>Assign your stRIF to someone you trust to vote on your behalf.</Paragraph>
            </div>
          </div>

          <div className="flex items-start mb-4">
            <div className="mr-2 mt-1">
              <span className="inline-block w-5 h-5 text-center rounded-sm">✅</span>
            </div>
            <div>
              <Paragraph className="font-bold">Receive delegations</Paragraph>
              <Paragraph>
                Others can delegate their voting power to you, increasing your influence in the DAO
              </Paragraph>
            </div>
          </div>

          <div className="flex items-start mb-4">
            <div className="mr-2 mt-1">
              <span className="inline-block w-5 h-5 text-center bg-transparent">💡</span>
            </div>
            <div>
              <Paragraph>
                Start by delegating or ask others to delegate to you to participate in governance
              </Paragraph>
            </div>
          </div>
        </div>

        {isDelegateModalOpened && (
          <DelegateModal
            onClose={() => setIsDelegateModalOpened(false)}
            onDelegateTxStarted={onDelegateTxStarted}
          />
        )}
      </div>
    )
  }

  return (
    <div className="mb-6" data-testid="DelegationSection">
      {/* Header Components*/}
      <div className="flex flex-row justify-between mb-6">
        <HeaderTitle className="w-[80%]">DELEGATION</HeaderTitle>
        <div className="flex flex-row w-[20%] pl-3">
          <Button
            variant="outlined"
            onClick={() => setIsDelegateModalOpened(true)}
            buttonProps={{ style: { width: '93px' } }}
            data-testid="Delegate"
          >
            Delegate
          </Button>
          <DelegatePopover />
        </div>
      </div>
      {!isExternalDelegatedAmountLoading && <Table data={[delegatedToMe]} />}
      <Table data={[delegatee]} />
      {isDelegateModalOpened && (
        <DelegateModal
          onClose={() => setIsDelegateModalOpened(false)}
          onDelegateTxStarted={onDelegateTxStarted}
        />
      )}
    </div>
  )
}

const DelegatePopover = () => (
  <Popover
    className="self-center ml-1"
    position="left-top"
    content={
      <>
        <Paragraph size="small" className="font-bold mb-1">
          Delegate your voting power
        </Paragraph>
        <Paragraph size="small">
          Your stRIF balance for allocations in Collective Rewards <b>will not be affected.</b>
        </Paragraph>
      </>
    }
  >
    <QuestionIcon className="ml-1" />
  </Popover>
)
