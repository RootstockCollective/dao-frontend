import { HolderColumn } from '@/app/communities/HolderColumn'
import { Table } from '@/components/Table'
import { HeaderTitle } from '@/components/Typography'
import { useAccount } from 'wagmi'
import { RenderTotalBalance } from '../Balances/RenderTotalBalance'
import { BalancesProvider } from '../Balances/context/BalancesContext'
import { useDelegate } from './hooks/useDelegate'

export const DelegationSection = () => {
  const { address } = useAccount()
  const { delegateeAddress } = useDelegate(address)

  if (!delegateeAddress || delegateeAddress === address) {
    return null
  }

  const delegatee = {
    'Voting Power Delegated': <HolderColumn address={delegateeAddress} />,
    Amount: <RenderTotalBalance symbol="stRIF" />,
  }
  return (
    <>
      <HeaderTitle className="mb-6">Delegation</HeaderTitle>
      <BalancesProvider>
        <Table data={[delegatee]} />
      </BalancesProvider>
    </>
  )
}
