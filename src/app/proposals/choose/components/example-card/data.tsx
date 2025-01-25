import { ReactElement } from 'react'
import type { ProposalType } from '../../types'

interface Example {
  title: string
  proposer: string
  proposalId: string
  text: ReactElement
  description: string
}

export const exampleCardData: Record<ProposalType, Example> = {
  Standard: {
    title: 'Tokenized Microstrategy On Rootstock - Sailing Protocol',
    proposalId: '409',
    proposer: 'Cryptodude.rsk',
    text: (
      <div>
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
    text: (
      <div>
        <p>
          OpenOcean is a leading DEX Aggregator, cross-chain swap aggregator, and web3 middleware developer in
          web3, offering a suite of trading tools across 30+ chains (including EVM and non-EVM chains) and
          1,000+ decentralized liquidity sources to provide users with the best prices.
        </p>
      </div>
    ),
    description: 'Example of a Builder activation proposal',
  },
  Deactivation: {
    title: 'OpenOcean Deactivation',
    proposalId: '7842',
    proposer: '0x023...De34Bf',
    text: (
      <div>
        <p>
          This proposal recommends the deactivation of OpenOcean as a Builder within the Rootstock Collective
          DAO. Following an evaluation of the builder’s progress and alignment with the DAO’s priorities, we
          suggest ending OpenOcean’s active engagement due to lack of activity
        </p>
        <p>
          Deactivating OpenOcean ensures that DAO resources are focused on builders and initiatives that align
          with our current objectives. This decision allows us to redirect attention and funding toward
          higher-priority projects while maintaining transparency and accountability.
        </p>
      </div>
    ),
    description: 'Example of a Builder deactivation proposal',
  },
}
