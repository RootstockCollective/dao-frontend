'use client'
import { MetricsCard } from '@/components/MetricsCard'
import { Popover } from '@/components/Popover'
import { Paragraph, Span } from '@/components/Typography'
import { useRouter } from 'next/navigation'
import { useVotingPower } from './hooks/useVotingPower'
import { formatNumberWithCommas } from '@/lib/utils'
import { QuestionIcon } from '@/components/Icons'
import Big, { round } from '@/lib/big'
import { useGetExternalDelegatedAmount } from '@/shared/hooks/useGetExternalDelegatedAmount'
import { useAccount } from 'wagmi'
import { formatEther } from 'viem'

export function ProposalsSummary({
  activeProposals,
  totalProposals,
}: {
  activeProposals: string
  totalProposals: string
}) {
  const { address, isConnected } = useAccount()
  const { amount: amountDelegatedToMe, isLoading: isExternalDelegatedAmountLoading } =
    useGetExternalDelegatedAmount(address)

  const { totalVotingPower = '' } = useVotingPower()

  return (
    <>
      <div className="grid grid-rows-1 gap-[32px] mb-[100px]">
        <div>
          <div className="flex gap-x-[24px]">
            <div>
              <VotingPowerPopover />
              <Paragraph
                className="text-[48px] text-primary tracking-[-0.96px]"
                fontFamily="kk-topo"
                data-testid="VotingPower"
              >
                {totalVotingPower
                  ? formatNumberWithCommas(round(totalVotingPower, undefined, Big.roundDown))
                  : '-'}
              </Paragraph>
            </div>
            <div>
              <DelegatedVotingPowerPopover />
              <Paragraph
                className="text-[48px] text-primary tracking-[-0.96px]"
                fontFamily="kk-topo"
                data-testid="VotingPower"
              >
                {!isExternalDelegatedAmountLoading && isConnected
                  ? formatNumberWithCommas(round(formatEther(amountDelegatedToMe), undefined, Big.roundDown))
                  : '-'}
              </Paragraph>
            </div>
          </div>
        </div>
        <div className="flex flex-row gap-x-6">
          <div className="w-[272px]">
            <MetricsCard title="Proposals created" amount={totalProposals.toString()} borderless />
          </div>
          <div className="w-[272px]">
            <MetricsCard title="Active proposals for voting" amount={activeProposals.toString()} borderless />
          </div>
        </div>
      </div>
    </>
  )
}

const VotingPowerPopoverContent = () => {
  const router = useRouter()
  return (
    <>
      <Paragraph size="small" className="font-bold mb-1" data-testid="PopoverTitle">
        How is my voting power calculated?
      </Paragraph>
      <Paragraph size="small" data-testid="PopoverContent">
        Your voting power is determined by the amount of stRIF (staked RIF) you hold, whether you have
        delegated this voting power to someone else, and also by someone else who may have delegated their
        voting power to you. <br /> <br /> To increase your voting power,{' '}
        <Span
          className="text-primary text-[14px] hover:underline cursor-pointer"
          onClick={() => router.push('/user?action=stake')}
          data-testid="PopoverLink"
        >
          stake RIF tokens now
        </Span>
        .
      </Paragraph>
    </>
  )
}

const VotingPowerPopover = () => (
  <Popover content={<VotingPowerPopoverContent />}>
    <button className="flex flex-row">
      <Paragraph className="text[16px] font-[700]">My Voting Power</Paragraph>
      <QuestionIcon className="ml-1" />
    </button>
  </Popover>
)

const DelegatedVotingPowerPopoverContent = () => {
  return (
    <Paragraph size="small" data-testid="DelegatedVotingPowerPopoverContent">
      Delegated Voting Power represents the total voting influence assigned to you by other participants. This
      allows you to vote on their behalf in governance decisions.
    </Paragraph>
  )
}

const DelegatedVotingPowerPopover = () => (
  <Popover content={<DelegatedVotingPowerPopoverContent />}>
    <button className="flex flex-row">
      <Paragraph className="text[16px] font-[700]">Delegated Voting Power</Paragraph>
      <QuestionIcon className="ml-1" />
    </button>
  </Popover>
)
