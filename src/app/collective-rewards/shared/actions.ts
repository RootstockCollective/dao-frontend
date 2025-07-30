'use server'

import { client } from '@/shared/components/ApolloClient'
import { gql as apolloGQL } from '@apollo/client'
import { AbiData, BuilderData } from './hooks/useGetABI'

const query = apolloGQL`
  query AbiMetricsData {
    builders(
      where: { state_: { initialized: true } }
      orderBy: totalAllocation
      orderDirection: desc
    ) {
      id
      totalAllocation
      backerRewardPercentage {
        id
        next
        previous
        cooldownEndTime
      }
      state {
        initialized
        communityApproved
        kycApproved
        kycPaused
        selfPaused
      }
    }
    cycles(first: 1, orderBy: id, orderDirection: desc) {
      id
      rewardsERC20
      rewardsRBTC
    }
  }
`

type Override<Type, NewType> = Omit<Type, keyof NewType> & NewType
type TheGraphABIData = Override<
  AbiData,
  {
    builders: Override<
      BuilderData,
      {
        state: {
          initialized: boolean
          kycApproved: boolean
          communityApproved: boolean
          kycPaused: boolean
          selfPaused: boolean
        }
      }
    >[]
  }
>

export async function fetchABIData() {
  const { data: theGraphAbiData } = await client.query<TheGraphABIData>({ query })
  // map thegraph abi data to the on chain type
  const abiData = {
    ...theGraphAbiData,
    builders: theGraphAbiData.builders.map(builder => ({
      ...builder,
      state: {
        ...builder.state,
        activated: builder.state.initialized,
        kycApproved: builder.state.kycApproved,
        communityApproved: builder.state.communityApproved,
        paused: builder.state.selfPaused,
        revoked: builder.state.kycPaused,
      },
    })),
  }

  return abiData
}
