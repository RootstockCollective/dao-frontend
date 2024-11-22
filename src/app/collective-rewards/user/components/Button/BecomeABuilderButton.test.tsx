import { BecomeABuilderButton } from './BecomeABuilderButton'
import { useGetBuilders } from '@/app/collective-rewards/user/hooks/useGetBuilders'
import { AlertProvider, useAlertContext } from '@/app/providers/AlertProvider'
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, waitFor } from '@testing-library/react'
import { Builder, BuilderStateFlags } from '@/app/collective-rewards/types'

vi.mock('@/app/collective-rewards/user/hooks/useGetBuilders', () => {
  return {
    useGetBuilders: vi.fn(),
  }
})

vi.mock('@/app/providers/AlertProvider', () => ({
  useAlertContext: vi.fn(),
  AlertProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const renderWithAlertProvider = (children: React.ReactNode) => {
  return render(<AlertProvider>{children}</AlertProvider>)
}

describe('BecomeABuilderButton', () => {
  const builderAddress = '0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'
  const proposalId = 1n
  const builderData: Builder = {
    address: builderAddress,
    builderName: 'builderName',
    proposal: {
      id: proposalId,
      date: '1723309061',
      name: 'proposalName',
      description: 'description',
    },
    gauge: '0x01',
    stateFlags: { activated: false, communityApproved: false } as BuilderStateFlags,
  }
  const buildersData = {
    [builderAddress]: builderData,
  }
  const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
  const setAlertMessageSpy = vi.fn()

  beforeEach(() => {
    vi.mocked(useGetBuilders).mockImplementation(() => {
      return {
        data: buildersData,
        isLoading: false,
        error: null,
      }
    })

    vi.mocked(useAlertContext).mockReturnValue({
      setMessage: setAlertMessageSpy,
      message: null,
    })
  })

  afterEach(() => {
    setAlertMessageSpy.mockClear()
    consoleErrorSpy.mockClear()
    cleanup()
  })

  test('should render if builder is in progress', async () => {
    const { findByText } = renderWithAlertProvider(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('In Progress')).toBeVisible()
  })

  test('should render if builder is whitelisted', async () => {
    builderData.stateFlags = { activated: true, communityApproved: true } as BuilderStateFlags
    const { findByText } = renderWithAlertProvider(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('You are a Builder')).toBeVisible()
  })

  test('should render registration button if builder does not have a proposal', async () => {
    const { findByText } = renderWithAlertProvider(
      <BecomeABuilderButton address="0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD827" />,
    )

    expect(await findByText('Become a builder')).toBeVisible()
  })

  test('should use alert for error message if fails while getting the builders', async () => {
    const expectedLoadingDataError = new Error('Error while loading data, please try again.')

    vi.mocked(useGetBuilders).mockImplementation(() => {
      return {
        data: {},
        isLoading: false,
        error: expectedLoadingDataError,
      }
    })
    renderWithAlertProvider(<BecomeABuilderButton address={builderAddress} />)

    expect(setAlertMessageSpy).toHaveBeenCalledWith({
      content: expectedLoadingDataError.message,
      severity: 'error',
      title: `Error loading builder with address ${builderAddress}`,
    })
  })

  test('should render loading message', async () => {
    vi.mocked(useGetBuilders).mockReturnValue({
      data: buildersData,
      isLoading: true,
      error: null,
    })
    const { queryByText } = renderWithAlertProvider(<BecomeABuilderButton address={builderAddress} />)

    await waitFor(() => {
      expect(queryByText('In Progress')).not.toBeInTheDocument()
      expect(queryByText('Whitelisted')).not.toBeInTheDocument()
      expect(queryByText('Become a builder')).not.toBeInTheDocument()
    })
  })
})
