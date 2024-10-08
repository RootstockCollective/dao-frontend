import { render, waitFor } from '@testing-library/react'
import { BecomeABuilderButton } from '@/app/bim/BecomeABuilderButton'
import { BuilderInfo, ProposalsStateMap } from '@/app/bim/types'
import { expect, describe, test } from '@jest/globals'
import { useGetBuilders } from '@/app/bim/hooks/useGetBuilders'
import { useGetProposalsState } from '@/app/bim/whitelist/hooks/useGetProposalsState'
import { CreateBuilderProposalEventLog } from '@/app/proposals/hooks/useFetchLatestProposals'
import { ProposalState } from '@/shared/types'

jest.mock('@/app/bim/hooks/useGetBuilders', () => {
  return {
    useGetBuilders: jest.fn(),
  }
})

jest.mock('@/app/bim/whitelist/hooks/useGetProposalsState', () => {
  return {
    useGetProposalsState: jest.fn(),
  }
})

describe('BecomeABuilderButton', () => {
  const builderAddress = '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
  const proposalId = 1n
  let buildersData: BuilderInfo[]
  let proposalsStateMapData: ProposalsStateMap

  beforeEach(() => {
    buildersData = [
      {
        status: 'In progress',
        address: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        proposals: [
          {
            args: {
              proposalId,
              description: 'description',
            },
            timeStamp: 1723309061,
          },
        ] as CreateBuilderProposalEventLog[],
      },
    ]
    jest.mocked(useGetBuilders).mockReturnValue({
      data: buildersData,
      isLoading: false,
      error: null,
    })
    proposalsStateMapData = {
      [proposalId.toString()]: ProposalState.Pending,
    }
    jest.mocked(useGetProposalsState).mockReturnValue({
      data: proposalsStateMapData,
      isLoading: false,
      error: null,
    })
  })

  test('should render if builder is in progress', async () => {
    const { findByText } = render(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('Waiting for approval')).toBeVisible()
  })

  test('should render if builder is whitelisted', async () => {
    buildersData[0].status = 'Whitelisted'
    jest.mocked(useGetProposalsState).mockReturnValue({
      data: {
        [proposalId.toString()]: ProposalState.Executed,
      },
      isLoading: false,
      error: null,
    })
    const { findByText } = render(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('Whitelisted')).toBeVisible()
  })

  test('should render not found if builder does not have a proposal', async () => {
    const { findByText } = render(
      <BecomeABuilderButton address="0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD827" />,
    )

    expect(await findByText('Become a builder')).toBeVisible()
  })

  test('should render not found if builder have a proposal in a invalid state', async () => {
    jest.mocked(useGetProposalsState).mockReturnValue({
      data: {
        [proposalId.toString()]: ProposalState.Canceled,
      },
      isLoading: false,
      error: null,
    })
    const { findByText } = render(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('Become a builder')).toBeVisible()
  })

  test('should render error message if fails while getting the builders', async () => {
    jest.mocked(useGetBuilders).mockReturnValue({
      data: buildersData,
      isLoading: false,
      error: new Error('Error while loading data, please try again.'),
    })
    const { findByText } = render(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('Error loading builders.')).toBeVisible
  })

  test('should render error message if fails while getting the proposals states', async () => {
    jest.mocked(useGetProposalsState).mockReturnValue({
      data: proposalsStateMapData,
      isLoading: false,
      error: {
        name: 'Error',
        message: 'Error while loading data, please try again.',
        stack: '',
        cause: null,
      },
    })
    const { findByText } = render(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('Error loading proposals state.')).toBeVisible
  })

  test('should render loading message', async () => {
    jest.mocked(useGetBuilders).mockReturnValue({
      data: buildersData,
      isLoading: true,
      error: null,
    })
    const { queryByText } = render(<BecomeABuilderButton address={builderAddress} />)

    await waitFor(async () => {
      expect(await queryByText('Waiting for approval')).not.toBeInTheDocument()
      expect(await queryByText('Whitelisted')).not.toBeInTheDocument()
      expect(await queryByText('Become a builder')).not.toBeInTheDocument()
    })
  })
})
