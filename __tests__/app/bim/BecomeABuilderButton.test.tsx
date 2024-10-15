import { BecomeABuilderButton } from '@/app/bim/BecomeABuilderButton'
import { useGetBuilderByAddress } from '@/app/bim/hooks/useGetBuilders'
import { BuilderInfo } from '@/app/bim/types'
import { useGetProposalsState } from '@/app/bim/whitelist/hooks/useGetProposalsState'
import { CreateBuilderProposalEventLog } from '@/app/proposals/hooks/useFetchLatestProposals'
import { AlertProvider, useAlertContext } from '@/app/providers/AlertProvider'
import { ProposalState } from '@/shared/types'
import { describe, expect, test } from '@jest/globals'
import { render, waitFor } from '@testing-library/react'

jest.mock('@/app/bim/hooks/useGetBuilders', () => {
  return {
    useGetBuilderByAddress: jest.fn(),
  }
})

jest.mock('@/app/bim/whitelist/hooks/useGetProposalsState', () => {
  return {
    useGetProposalsState: jest.fn(),
  }
})

jest.mock('@/app/providers/AlertProvider', () => ({
  useAlertContext: jest.fn(),
  AlertProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const renderWithAlertProvider = (children: React.ReactNode) => {
  return render(<AlertProvider>{children}</AlertProvider>)
}

describe('BecomeABuilderButton', () => {
  const builderAddress = '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
  const proposalId = 1n
  const buildersData: BuilderInfo = {
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
  }
  const proposalsToStates = {
    [proposalId.toString()]: ProposalState.Pending,
  }
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
  const setAlertMessageSpy = jest.fn()

  const expectedLoadingDataError = new Error('Error while loading data, please try again.')
  const expectedLoadingBuilderError = new Error('Error loading builder proposal events')

  beforeEach(() => {
    jest.mocked(useGetBuilderByAddress).mockImplementation(() => {
      return {
        data: buildersData,
        isLoading: false,
        error: null,
      }
    })
    jest.mocked(useGetProposalsState).mockReturnValue({
      data: proposalsToStates,
      isLoading: false,
      error: null,
    })
    jest.mocked(useAlertContext).mockReturnValue({
      setMessage: setAlertMessageSpy,
      message: null,
    })
  })

  afterEach(() => {
    setAlertMessageSpy.mockClear()
    consoleErrorSpy.mockClear()
  })

  test('should render if builder is in progress', async () => {
    const { findByText } = renderWithAlertProvider(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('Waiting for approval')).toBeVisible()
  })

  test('should render if builder is whitelisted', async () => {
    buildersData.status = 'Whitelisted'
    jest.mocked(useGetProposalsState).mockReturnValue({
      data: {
        [proposalId.toString()]: ProposalState.Executed,
      },
      isLoading: false,
      error: null,
    })
    const { findByText } = renderWithAlertProvider(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('Whitelisted')).toBeVisible()
  })

  test('should render registration button if builder does not have a proposal', async () => {
    const { findByText } = renderWithAlertProvider(
      <BecomeABuilderButton address="0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD827" />,
    )

    expect(await findByText('Become a builder')).toBeVisible()
  })

  test('should render registration button if builder have a proposal in a invalid state', async () => {
    jest.mocked(useGetProposalsState).mockReturnValue({
      data: {
        [proposalId.toString()]: ProposalState.Canceled,
      },
      isLoading: false,
      error: null,
    })
    const { findByText } = renderWithAlertProvider(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('Become a builder')).toBeVisible()
  })

  test('should use alert for error message if fails while getting the builders', async () => {
    jest.mocked(useGetBuilderByAddress).mockImplementation(() => {
      return {
        data: undefined,
        isLoading: false,
        error: expectedLoadingDataError,
      }
    })
    renderWithAlertProvider(<BecomeABuilderButton address={builderAddress} />)

    expect(setAlertMessageSpy).toHaveBeenCalledWith({
      content: expectedLoadingDataError.message,
      severity: 'error',
      title: `Error loading builder with address ${buildersData.address}`,
    })
    expect(consoleErrorSpy).toHaveBeenCalledWith('🐛 builderLoadingError:', expectedLoadingDataError)
  })

  test('should use alert for error message if fails while getting the proposals states', async () => {
    jest.mocked(useGetProposalsState).mockReturnValue({
      data: proposalsToStates,
      isLoading: false,
      error: {
        message: expectedLoadingBuilderError.message,
        name: 'Error',
        stack: '',
        cause: null,
      },
    })
    renderWithAlertProvider(<BecomeABuilderButton address={builderAddress} />)

    expect(setAlertMessageSpy).toHaveBeenCalledWith({
      content: expectedLoadingBuilderError.message,
      severity: 'error',
      title: 'Error loading builder proposal events',
    })
  })

  test('should render loading message', async () => {
    jest.mocked(useGetBuilderByAddress).mockReturnValue({
      data: buildersData,
      isLoading: true,
      error: null,
    })
    const { queryByText } = renderWithAlertProvider(<BecomeABuilderButton address={builderAddress} />)

    await waitFor(() => {
      expect(queryByText('Waiting for approval')).not.toBeInTheDocument()
      expect(queryByText('Whitelisted')).not.toBeInTheDocument()
      expect(queryByText('Become a builder')).not.toBeInTheDocument()
    })
  })
})
