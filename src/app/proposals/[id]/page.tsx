import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/Breadcrumb'
import { MainContainer } from '@/components/MainContainer/MainContainer'
import { MetricsCard } from '@/components/MetricsCard'
import { Popover } from '@/components/Popover'
import { Header, Paragraph } from '@/components/Typography'
import { truncate } from '@/lib/utils'
import { FC } from 'react'
import { FaRegQuestionCircle } from 'react-icons/fa'

const getProposalData = async (id: string): Promise<any> => {
  return new Promise(resolve => {
    resolve({
      id,
      title:
        'Amazing and surprisingly long proposal name that have not sense at all, but we can do whatever we want because we are awesome, LFG!!!! 🚀',
      description:
        'Crypto ipsum bitcoin ethereum dogecoin litecoin. Aave ren livepeer WAX USD hedera solana revain dogecoin ICON. Uniswap serum klaytn PancakeSwap monero hedera. TerraUSD arweave litecoin fantom dash EOS digibyte digibyte. Kadena ren polygon aave XRP amp decred gala livepeer enjin. Bancor ICON decred livepeer zcash horizen bancor arweave. Kava ipsum binance zcash siacoin velas. Maker harmony helium horizen waves ICON decentraland. Aave dash vechain helium stacks terraUSD. Loopring monero zcash uniswap secret. Secret enjin serum solana WAX holo polygon. Zcash gala secret holo ethereum decentraland. Horizen ethereum BitTorrent helium filecoin uniswap. Avalanche polygon binance PancakeSwap binance stellar chiliz ipsum tether waves. USD decred revain EOS bitcoin ethereum solana compound. PancakeSwap avalanche telcoin solana polygon golem arweave stacks. Hedera. ',
      proposedBy: 'Cryptodude.rsk',
      created: new Date(),
      votes: {
        for: 123000,
        against: 12,
        abstain: 0,
      },
      actions: {
        tokenSymbol: 'RIF',
        amount: 234,
        toAddress: '0x333...444',
      },
    })
  })
}

export default async function ProposalView({ params }: { params: { id: string } }) {
  const proposal = await getProposalData(params.id)
  return (
    <MainContainer>
      <div className="pl-4 grid grid-rows-1 gap-[32px] mb-[100px]">
        <BreadcrumbSection title={proposal.title} />
        <Header className="text-2xl">{proposal.title}</Header>
        <div className="flex flex-row">
          <Paragraph className="text-sm text-gray-500">
            Proposed by: <span className="text-primary">{proposal.proposedBy}</span>
          </Paragraph>
          <Paragraph className="text-sm text-gray-500 ml-4">
            Created: <span className="text-primary">{proposal.created.toDateString()}</span>
          </Paragraph>
          <Paragraph className="text-sm text-primary ml-4">{params.id}</Paragraph>
        </div>
        <MetricsSection />
      </div>
    </MainContainer>
  )
}

const BreadcrumbSection: FC<{ title: string }> = ({ title }) => {
  return (
    <Breadcrumb className="pb-4 border-b">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/proposals">Proposals</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="max-w-lg truncate">{title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

const PopoverContent = () => (
  <>
    <p className="font-bold mb-1">How is my voting power calculated?</p>
    <p>
      Your voting power is calculated as the number of tokens (votes) that have been delegated to you before
      the proposal became active. You can delegate your votes to yourself, or to someone else. Others can also
      delegate their votes to you.
    </p>
  </>
)

const VotingPowerPopover = () => (
  <Popover content={<PopoverContent />}>
    <span className="flex flex-row">
      <p>My voting power</p>
      <FaRegQuestionCircle className="ml-1" />
    </span>
  </Popover>
)
const MetricsSection = () => (
  <>
    <MetricsCard borderless title={<VotingPowerPopover />} amount="230" />
    <div className="flex flex-row gap-x-6">
      <MetricsCard title="Votes" amount="235,23m" />
      <MetricsCard title="Total voting power delegated" amount="230" />
      <MetricsCard title="Proposals created" amount="12" />
    </div>
  </>
)
