import { Table } from '@/components/Table'
import { HeaderTitle } from '@/components/Typography'
import { RenderTotalBalance } from '../Balances/RenderTotalBalance'
import { BalancesProvider } from '../Balances/context/BalancesContext'
import { useDelegate } from './hooks/useDelegate'
import { useAccount } from 'wagmi'
import { HolderColumn } from '@/app/communities/HolderColumn'

export const DelegationSection = () => {
  const { address } = useAccount()
  const { delegateeAddress } = useDelegate(address)

  if (!delegateeAddress || address === delegateeAddress) {
    return null
  }

  const delegatees = [
    {
      'Voting Power Received': <HolderColumn address={delegateeAddress} />,
      Amount: <RenderTotalBalance symbol="stRIF" />,
    },
  ]
  return (
    <>
      <HeaderTitle className="mb-6">Delegation</HeaderTitle>
      <BalancesProvider>
        <Table data={delegatees} />
      </BalancesProvider>
    </>
  )
}
