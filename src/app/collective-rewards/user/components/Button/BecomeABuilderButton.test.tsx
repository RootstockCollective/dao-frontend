import { BecomeABuilderButton } from './BecomeABuilderButton'
import { useGetBuilders } from '@/app/collective-rewards/user/hooks/useGetBuilders'
import { AlertProvider, useAlertContext } from '@/app/providers/AlertProvider'
import { describe, expect, test, vi, beforeEach, afterEach } from 'vitest'
import { cleanup, render, waitFor } from '@testing-library/react'
import { Builder, BuilderStateFlags } from '@/app/collective-rewards/types'
import { BuilderContextProvider } from '@/app/collective-rewards/user'

vi.mock('@/app/collective-rewards/user/hooks/useGetBuilders', () => ({
  useGetBuilders: vi.fn(),
}))

vi.mock('@/app/providers/AlertProvider', () => ({
  useAlertContext: vi.fn(),
  AlertProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

const renderWithAlertProvider = (children: React.ReactNode) => {
  return render(
    <AlertProvider>
      <BuilderContextProvider>{children}</BuilderContextProvider>
    </AlertProvider>,
  )
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
      preserveCurrentAlert: () => undefined,
    })
  })

  afterEach(() => {
    setAlertMessageSpy.mockClear()
    consoleErrorSpy.mockClear()
    cleanup()
  })

  test('should render registration button if builder does not have a proposal', async () => {
    const { findByText } = renderWithAlertProvider(
      <BecomeABuilderButton address="0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD827" />,
    )

    expect(await findByText('Become a builder')).toBeVisible()
  })

  test('should render in progress component if there are not executed proposals', async () => {
    builderData.gauge = undefined
    const { findByText } = renderWithAlertProvider(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('In Progress')).toBeVisible()
  })

  test('should render in progress component if is not activated and approved by the community', async () => {
    builderData.stateFlags = {
      activated: false,
      communityApproved: true,
    } as BuilderStateFlags
    const { findByText } = renderWithAlertProvider(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('In Progress')).toBeVisible()
  })

  test('should render in progress component if is activated and not approved by the community', async () => {
    builderData.gauge = undefined
    builderData.stateFlags = {
      activated: true,
      communityApproved: false,
      kycApproved: true,
    } as BuilderStateFlags
    const { findByText } = renderWithAlertProvider(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('In Progress')).toBeVisible()
  })

  test('should render de-activated component if builder is deactivated(have a gauge but it is not approved by the community)', async () => {
    builderData.gauge = '0x01'
    builderData.stateFlags = { activated: false, communityApproved: false } as BuilderStateFlags
    const { findByText } = renderWithAlertProvider(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('De-activated')).toBeVisible()
  })

  test('should render de-activated component if builder is kyc revoked and paused', async () => {
    builderData.gauge = '0x01'
    builderData.stateFlags = {
      activated: true,
      communityApproved: false,
      kycApproved: false,
      paused: true,
    } as BuilderStateFlags
    const { findByText } = renderWithAlertProvider(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('De-activated')).toBeVisible()
  })

  test('should render de-activated component if builder is kyc revoked and not paused', async () => {
    builderData.gauge = '0x01'
    builderData.stateFlags = {
      activated: true,
      communityApproved: false,
      kycApproved: false,
      paused: false,
    } as BuilderStateFlags
    const { findByText } = renderWithAlertProvider(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('De-activated')).toBeVisible()
  })

  test('should render paused component if builder is active, kyc approved, approved by the community and paused', async () => {
    builderData.stateFlags = {
      activated: true,
      communityApproved: true,
      kycApproved: true,
      paused: true,
    } as BuilderStateFlags
    const { findByText } = renderWithAlertProvider(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('Paused')).toBeVisible()
  })

  test('should render active component if builder is active, approve by the community, kyc approved and not revoked', async () => {
    builderData.stateFlags = {
      activated: true,
      communityApproved: true,
      kycApproved: true,
      revoked: false,
    } as BuilderStateFlags
    const { findByText } = renderWithAlertProvider(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('You are a Builder')).toBeVisible()
  })

  test('should render active component if builder is active, approve by the community, kyc approved and revoked', async () => {
    builderData.stateFlags = {
      activated: true,
      communityApproved: true,
      kycApproved: true,
      revoked: true,
    } as BuilderStateFlags
    const { findByText } = renderWithAlertProvider(<BecomeABuilderButton address={builderAddress} />)

    expect(await findByText('You are a Builder')).toBeVisible()
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
