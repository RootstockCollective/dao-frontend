'use client'

import { getTokenBalance } from '@/app/user/Balances/balanceUtils'
import { useGetAddressTokens } from '@/app/user/Balances/hooks/useGetAddressTokens'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { HeaderTitle, Paragraph } from '@/components/Typography'
import { useAccount } from 'wagmi'
import { useHandleErrors } from '../utils'
import { useBackerTotalAllocation } from './useBackerTotalAllocation'

type ValueProps = {
  value: string
}

type MetricsProps = ValueProps & {
  name: string
}

const Metric = ({ name, value }: MetricsProps) => {
  return (
    <div className="flex flex-col items-start gap-[10px]">
      <Paragraph className="font-bold tracking-[-0.28px] text-[14px]">{name}</Paragraph>
      <Paragraph className="font-kk-topo text-[48px] text-primary">{value}</Paragraph>
    </div>
  )
}

const Balance = ({ value }: ValueProps) => {
  // TODO: manage the isLoading and error states
  return <Metric name="Balance" value={value} />
}

const AllocatedAmount = ({ value }: ValueProps) => {
  // TODO: manage the isLoading state
  return <Metric name="Allocated amount" value={value} />
}

const UnallocatedAmount = ({ value }: ValueProps) => {
  return <Metric name="Unallocated amount" value={value} />
}

const MetricsLoader = () => {
  // TODO: I'm not sure if we need all of these or we could just call the token balance
  const { address, chainId } = useAccount()
  const query = useGetAddressTokens(address!, chainId as number)
  const stRIFBalance = getTokenBalance('stRIF', query.data)
  const balanceValue = `${stRIFBalance.balance} ${stRIFBalance.symbol}`

  // TODO: fetch allocated amount
  const { data: allocatedAmount, isLoading, error } = useBackerTotalAllocation(address!)
  useHandleErrors({ error, title: 'Failed to fetch allocated amount' })
  const allocatedAmountValue = `${allocatedAmount} ${stRIFBalance.symbol}`

  // TODO: unallocated amount to be calculated
  const unallocatedAmount = 0n

  const unallocatedAmountValue = `${unallocatedAmount} ${stRIFBalance.symbol}`
  // TODO: the isLoading state could be shared for the 3 components or 
  return (
    <>
      <Balance value={balanceValue} />
      <AllocatedAmount value={allocatedAmountValue} />
      <UnallocatedAmount value={unallocatedAmountValue} />
    </>
  )
}

export default function BuildersIncentiveMarket() {
  return (
    <MainContainer>
      <div className="grid grid-rows-1 gap-[32px]">
        <div className="flex flex-col justify-center items-start self-stretch gap-2">
          <HeaderTitle>Confirm strif allocation for the selected builders</HeaderTitle>
          <Paragraph className="font-normal leading-6 text-[rgba(255,255,255,0.6)]">
            Back builders who drive innovations. Review the selection and support the Builders you align with.
            Your allocations influence the rewards the Builders will receive.
          </Paragraph>
        </div>
        <div className="flex flex-col items-start gap-6 self-stretch">
          <div className="flex items-start gap-6 max-w-[750px]">
            <MetricsLoader />
          </div>
          <div>TODO: placeholder</div>
        </div>
      </div>
    </MainContainer>
  )
}
