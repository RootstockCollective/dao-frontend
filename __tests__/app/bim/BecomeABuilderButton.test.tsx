import { render, waitFor } from '@testing-library/react'
import { BecomeABuilderButton } from '@/app/bim/BecomeABuilderButton'
import { BuilderInfo } from '@/app/bim/types'
import { expect, describe, it } from '@jest/globals'
import { useGetBuilders } from '@/app/bim/hooks/useGetBuilders'
import { CreateBuilderProposalEventLog } from '@/app/proposals/hooks/useFetchLatestProposals'

jest.mock('@/app/bim/hooks/useGetBuilders', () => {
  return {
    useGetBuilders: jest.fn(),
  }
})

describe('BecomeABuilderButton', () => {
  let builderAddress = '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
  let data: BuilderInfo[]

  type CreateBuilderProposalEventLogArgs = CreateBuilderProposalEventLog['args']

  beforeEach(() => {
    data = [
      {
        name: 'Builder 1',
        status: 'In progress',
        address: '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826',
        proposals: [{
          args: { 
            description: 'description',
          } as CreateBuilderProposalEventLogArgs, 
          timeStamp: 1723309061,
        } as CreateBuilderProposalEventLog],
      },
    ]
    jest.mocked(useGetBuilders).mockReturnValue({
      data,
      isLoading: false,
      error: null,
    })
  })

  it('should render InProgressComponent', async () => {
    const { findByText } = render(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('Waiting for approval')).toBeVisible()
  })

  it('should render WhitelistedComponent', async () => {
    data[0].status = 'Whitelisted'
    const { findByText } = render(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('Whitelisted')).toBeVisible()
  })

  it('should render NotFoundComponent', async () => {
    const { findByText } = render(
      <BecomeABuilderButton address="0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD827" />,
    )

    expect(await findByText('Become a builder')).toBeVisible()
  })

  it('should render error message', async () => {
    jest.mocked(useGetBuilders).mockReturnValue({
      data,
      isLoading: false,
      error: new Error('Error while loading data, please try again.'),
    })
    const { findByText } = render(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('Error while loading data, please try again.')).toBeVisible
  })

  it('should render loading message', async () => {
    jest.mocked(useGetBuilders).mockReturnValue({
      data,
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
