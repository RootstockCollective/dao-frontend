import { Builder, BuilderStateFlags } from '@/app/collective-rewards/types'
import { useGetGaugesArray } from '@/app/collective-rewards/user/hooks/useGetGaugesArray'
import { getMostAdvancedProposal } from '@/app/collective-rewards/utils'
import { RawBuilderState } from '@/app/collective-rewards/utils/getBuilderGauge'
import { useGetProposalsState } from '@/app/collective-rewards/user'
import { useFetchCreateBuilderProposals } from '@/app/proposals/hooks/useFetchLatestProposals'
import { splitCombinedName } from '@/app/proposals/shared/utils'
import { BuilderRegistryAbi } from '@/lib/abis/v2/BuilderRegistryAbi'
import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { BackersManagerAddress } from '@/lib/contracts'
import { DateTime } from 'luxon'
import { useMemo } from 'react'
import { Address, getAddress } from 'viem'
import { useReadContracts } from 'wagmi'

export type UseGetBuilders = () => {
  data: Record<Address, Builder> // TODO review Builder type
  isLoading: boolean
  // TODO: review error type
  error: Error | null
}

export const useGetBuilders: UseGetBuilders = () => {
  /*
   * // TODO: we're missing builder with KYC only on v2
   * get Gauges
   * for each Gauge
   *    get Builder from Gauge
   *    get Builder state
   *    ignore the builder if paused or revoked (to be confirmed)
   */
  // get the gauges
  const { data: gauges, isLoading: gaugesLoading, error: gaugesError } = useGetGaugesArray('active')

  // get the builders for each gauge
  const gaugeToBuilderCalls = gauges?.map(
    gauge =>
      ({
        address: BackersManagerAddress,
        abi: BuilderRegistryAbi,
        functionName: 'gaugeToBuilder',
        args: [gauge],
      }) as const,
  )
  const {
    data: buildersResult,
    isLoading: buildersLoading,
    error: buildersError,
  } = useReadContracts<Address[]>({
    contracts: gaugeToBuilderCalls,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
    },
  })
  const builders = buildersResult?.map(builder => builder.result) as Address[]

  const builderToGauge = builders?.reduce<Record<Address, Address>>((acc, builder, index) => {
    acc[builder] = gauges![index]
    return acc
  }, {})

  // get the builder state for each builder
  const builderStatesCalls = builders?.map(
    builder =>
      ({
        address: BackersManagerAddress,
        abi: BuilderRegistryAbi,
        functionName: 'builderState',
        args: [builder],
      }) as const,
  )
  const {
    data: builderStatesResult,
    isLoading: builderStatesLoading,
    error: builderStatesError,
  } = useReadContracts({ contracts: builderStatesCalls, query: { refetchInterval: AVERAGE_BLOCKTIME } })

  // TODO: useFetchCreateBuilderProposals & useGetProposalsState & getMostAdvancedProposal can be joined
  const {
    data: proposalsByBuilder,
    isLoading: isLoadingProposalsByBuilder,
    error: proposalsByBuilderError,
  } = useFetchCreateBuilderProposals()

  const proposalIds = Object.values(proposalsByBuilder ?? {}).flatMap(events =>
    events.map(({ args }) => args.proposalId),
  )

  const {
    data: proposalsStateMap,
    isLoading: proposalsStateMapLoading,
    error: proposalsStateMapError,
  } = useGetProposalsState(proposalIds)

  const data: Record<Address, Builder> = useMemo(() => {
    const builderStates = builderStatesResult?.map(({ result }) => result as RawBuilderState)

    const statusByBuilder =
      builders?.reduce<Record<Address, BuilderStateFlags>>((acc, builder, index) => {
        const builderState = (builderStates?.[index] ?? [
          false,
          false,
          false,
          false,
          false,
          '',
          '',
        ]) as RawBuilderState
        const [activated, kycApproved, communityApproved, paused, revoked] = builderState
        acc[builder] = { activated, kycApproved, communityApproved, paused, revoked }

        return acc
      }, {}) ?? ({} as Record<Address, BuilderStateFlags>)

    return Object.entries(proposalsByBuilder ?? {}).reduce<Record<Address, Builder>>(
      (acc, [key, proposalsEvent]) => {
        const address = getAddress(key)
        const proposal = getMostAdvancedProposal(proposalsEvent, proposalsStateMap, statusByBuilder[address])

        if (proposal) {
          const {
            args: { proposalId, description },
            timeStamp,
          } = proposal
          const joiningDate = DateTime.fromSeconds(+timeStamp).toFormat('MMMM dd, yyyy')
          const [name, proposalDescription] = description.split(';')
          const { proposalName, builderName } = splitCombinedName(name)
          acc[address] = {
            proposal: {
              id: proposalId,
              name: proposalName,
              description: proposalDescription,
              date: joiningDate,
            },
            stateFlags: statusByBuilder[address],
            gauge: builderToGauge && builderToGauge[address],
            address,
            builderName,
          }
        }

        return acc
      },
      {},
    )
  }, [proposalsByBuilder, builderToGauge, proposalsStateMap, builderStatesResult, builders])

  const isLoading =
    isLoadingProposalsByBuilder ||
    builderStatesLoading ||
    buildersLoading ||
    gaugesLoading ||
    proposalsStateMapLoading
  const error =
    proposalsByBuilderError ?? builderStatesError ?? buildersError ?? gaugesError ?? proposalsStateMapError

  return {
    data,
    isLoading,
    error,
  }
}
// MOCK DATA FOR TESTING
const mockData: Record<Address, Builder> = {
  '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
    address: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    builderName: 'M_Awesome Builder',
    gauge: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    stateFlags: {
      activated: true,
      kycApproved: true,
      communityApproved: true,
      paused: false,
      revoked: false,
    },
    proposal: {
      id: 1n,
      name: 'First Builder Proposal',
      description: 'Building awesome DeFi tools',
      date: 'January 15, 2024',
    },
    backerRewardPercentage: {
      next: 0n,
      previous: 0n,
      cooldown: 0n,
    },
  },
  '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': {
    address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    builderName: 'M_Crypto Innovator',
    gauge: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    stateFlags: {
      activated: true,
      kycApproved: true,
      communityApproved: false,
      paused: false,
      revoked: false,
    },
    proposal: {
      id: 2n,
      name: 'Innovation Protocol',
      description: 'Creating innovative blockchain solutions',
      date: 'February 1, 2024',
    },
    backerRewardPercentage: {
      next: 0n,
      previous: 0n,
      cooldown: 0n,
    },
  },
  '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC': {
    address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
    builderName: 'M_Web3 Developer',
    gauge: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    stateFlags: {
      activated: true,
      kycApproved: false,
      communityApproved: false,
      paused: true,
      revoked: false,
    },
    proposal: {
      id: 3n,
      name: 'Web3 Infrastructure',
      description: 'Building core web3 infrastructure',
      date: 'February 10, 2024',
    },
    backerRewardPercentage: {
      next: 0n,
      previous: 0n,
      cooldown: 0n,
    },
  },
  '0x90F79bf6EB2c4f870365E785982E1f101E93b906': {
    address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
    builderName: 'M_DeFi Builder',
    gauge: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    stateFlags: {
      activated: false,
      kycApproved: true,
      communityApproved: false,
      paused: false,
      revoked: false,
    },
    proposal: {
      id: 4n,
      name: 'DeFi Protocol',
      description: 'Creating new DeFi primitives',
      date: 'February 15, 2024',
    },
    backerRewardPercentage: {
      next: 0n,
      previous: 0n,
      cooldown: 0n,
    },
  },
  '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65': {
    address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65',
    builderName: 'M_Smart Contract Expert',
    gauge: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    stateFlags: {
      activated: true,
      kycApproved: true,
      communityApproved: true,
      paused: false,
      revoked: true,
    },
    proposal: {
      id: 5n,
      name: 'Smart Contract Framework',
      description: 'Building secure smart contract templates',
      date: 'February 20, 2024',
    },
    backerRewardPercentage: {
      next: 0n,
      previous: 0n,
      cooldown: 0n,
    },
  },
  '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc': {
    address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc',
    builderName: 'M_DAO Specialist',
    gauge: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    stateFlags: {
      activated: true,
      kycApproved: true,
      communityApproved: true,
      paused: true,
      revoked: false,
    },
    proposal: {
      id: 6n,
      name: 'DAO Tools',
      description: 'Creating comprehensive DAO tooling',
      date: 'March 1, 2024',
    },
    backerRewardPercentage: {
      next: 0n,
      previous: 0n,
      cooldown: 0n,
    },
  },
  '0x976EA74026E726554dB657fA54763abd0C3a0aa9': {
    address: '0x976EA74026E726554dB657fA54763abd0C3a0aa9',
    builderName: 'M_Blockchain Developer',
    gauge: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
    stateFlags: {
      activated: false,
      kycApproved: false,
      communityApproved: false,
      paused: false,
      revoked: false,
    },
    proposal: {
      id: 7n,
      name: 'Blockchain Tools',
      description: 'Developing essential blockchain tools',
      date: 'March 5, 2024',
    },
    backerRewardPercentage: {
      next: 0n,
      previous: 0n,
      cooldown: 0n,
    },
  },
  '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955': {
    address: '0x14dC79964da2C08b23698B3D3cc7Ca32193d9955',
    builderName: 'M_Security Expert',
    gauge: '0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f',
    stateFlags: {
      activated: true,
      kycApproved: true,
      communityApproved: false,
      paused: false,
      revoked: false,
    },
    proposal: {
      id: 8n,
      name: 'Security Framework',
      description: 'Building security audit tools',
      date: 'March 10, 2024',
    },
    backerRewardPercentage: {
      next: 0n,
      previous: 0n,
      cooldown: 0n,
    },
  },
}
const getRandomRewardPercentage = () => BigInt(Math.floor(Math.random() * 1000000000000000001))

Object.values(mockData).forEach(builder => {
  builder.backerRewardPercentage = {
    next: getRandomRewardPercentage(),
    previous: getRandomRewardPercentage(),
    cooldown: getRandomRewardPercentage(),
  }
})
