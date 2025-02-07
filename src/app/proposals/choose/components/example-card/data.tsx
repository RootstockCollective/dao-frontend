import type { FC, HTMLAttributes } from 'react'
import type { ProposalType } from '../../types'

interface Example {
  title: string
  proposer: string
  proposalId: string
  Text: FC<HTMLAttributes<HTMLDivElement>>
  description: string
}

export const exampleCardData: Record<ProposalType, Example> = {
  Standard: {
    title: 'Tokenized Microstrategy On Rootstock - Sailing Protocol',
    proposalId: '409',
    proposer: 'Cryptodude.rsk',
    Text: props => (
      <div {...props}>
        <p>Open a Tokenized Microstrategy (MSTR) liquidity pool and provide seed liquidity.</p>
        <p>
          This pool will allow Rootstock users to buy and hold MSTR Stock Tokens fully on Rootstock, directly
          in their wallets. By holding MSTR Stock Tokens, users gain unique BTC exposure— tapping into
          Microstrategy’s treasury strategy for leveraged BTC positions. Through the Sailing Protocol, we
          bring MSTR on-chain, delivering this distinctive BTC-focused opportunity within the Rootstock
          ecosystem. Additionally, this initiative provides powerful marketing material, enabling us to
          promote “Tokenized Microstrategy for BTC Exposure on Rootstock.”
        </p>
        <p>
          We request $9,000 to open this pool and provide initial liquidity, while allowing anyone to come
          provide further liquidity afterward.
        </p>
      </div>
    ),
    description: 'Example of a grant proposal',
  },
  Activation: {
    title: 'OpenOcean',
    proposalId: '4465',
    proposer: '0x023...De34Bf',
    Text: props => (
      <div {...props}>
        <p>
          OpenOcean is a leading DEX Aggregator, cross-chain swap aggregator, and web3 middleware developer in
          web3, offering a suite of trading tools across 30+ chains (including EVM and non-EVM chains) and
          1,000+ decentralized liquidity sources to provide users with the best prices.
        </p>
      </div>
    ),
    description: 'Example of a Builder activation proposal',
  },
}
