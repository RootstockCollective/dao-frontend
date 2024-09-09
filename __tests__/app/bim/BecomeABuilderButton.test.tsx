import { render } from '@testing-library/react'
import { BecomeABuilderButton } from '@/app/bim/BecomeABuilderButton'
import { BuilderOffChainInfo } from '@/app/bim/types'
import { useFetchWhitelistedBuilders } from '@/app/bim/whitelist/hooks/useFetchWhitelistedBuilders'
import { expect, describe, it } from '@jest/globals'

jest.mock('@/app/bim/whitelist/hooks/useFetchWhitelistedBuilders', () => {
  return {
    useFetchWhitelistedBuilders: jest.fn(),
  }
})

describe('BecomeABuilderButton', () => {
  let builderAddress = '0x1234567890'
  let data: BuilderOffChainInfo[]

  beforeEach(() => {
    data = [
      {
        name: 'Builder 1',
        joiningData: '2024-06-01',
        status: 'KYC Under Review',
        proposalDescription: 'Lorem ipsum dolor sit amet',
        address: '0x1234567890',
      },
    ]
    jest.mocked(useFetchWhitelistedBuilders).mockReturnValue({
      data,
      isLoading: false,
      error: null,
    })
  })

  it('should render KYCUnderReviewComponent', async () => {
    const { findByText } = render(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('KYC Under Review')).toBeVisible()
  })

  it('should render KYCApprovedComponent', async () => {
    data[0].status = 'KYC Approved'
    const { findByText } = render(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('Create whitelist proposal')).toBeVisible()
  })

  it('should render InProgressComponent', async () => {
    data[0].status = 'In progress'
    const { findByText } = render(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('Waiting for approval')).toBeVisible()
  })

  it('should render WhitelistedComponent', async () => {
    data[0].status = 'Whitelisted'
    const { findByText } = render(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('Whitelisted')).toBeVisible()
  })

  it('should render NotFoundComponent', async () => {
    const { findByText } = render(<BecomeABuilderButton address="0x987654321" />)

    expect(await findByText('Become a builder')).toBeVisible()
  })

  it('should render error message', async () => {
    jest.mocked(useFetchWhitelistedBuilders).mockReturnValue({
      data,
      isLoading: false,
      error: new Error('Error while loading data, please try again.'),
    })
    const { findByText } = render(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('Error while loading data, please try again.')).toBeVisible
  })

  it('should render loading message', async () => {
    jest.mocked(useFetchWhitelistedBuilders).mockReturnValue({
      data,
      isLoading: true,
      error: null,
    })
    const { queryByText } = render(<BecomeABuilderButton address={builderAddress} />)

    expect(await queryByText('KYC Under Review')).not.toBeInTheDocument()
    expect(await queryByText('Create whitelist proposal')).not.toBeInTheDocument()
    expect(await queryByText('Waiting for approval')).not.toBeInTheDocument()
    expect(await queryByText('Whitelisted')).not.toBeInTheDocument()
    expect(await queryByText('Become a builder')).not.toBeInTheDocument()
  })
})
