import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ReactNode } from 'react'
import { parseEther } from 'viem'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import Big from '@/lib/big'

import { AbiBoostPositionState } from '../hooks/useAbiBoost'
import { BackedBuilderUnderVote } from '../hooks/useBackedBuildersUnderDeactivationVote'
import {
  AbiBoostBanner,
  BackingBoostHintView,
  BoostedRateCard,
  DeactivationVoteBanners,
  DrawerBoostSummaryView,
} from './BackingBoost'

const mockPush = vi.fn()
const mockPosition = vi.fn<() => AbiBoostPositionState>()
const mockBuildersUnderVote = vi.fn<() => BackedBuilderUnderVote[]>()

vi.mock('../hooks/useAbiBoost', () => ({
  useIsAbiBoostEnabled: () => true,
  useAbiBoostPosition: () => mockPosition(),
  useGoToBackBuilders: () => () => mockPush('/builders'),
}))

vi.mock('../hooks/useBackedBuildersUnderDeactivationVote', () => ({
  useBackedBuildersUnderDeactivationVote: () => mockBuildersUnderVote(),
}))

// The current ABI is 5%, so a boosted backing earns 12.5%
vi.mock('@/app/shared/components/AnnualBackersIncentivesLoader', () => ({
  AnnualBackerIncentivesLoader: ({
    render,
  }: {
    render: (p: { data: Big; isLoading: boolean }) => ReactNode
  }) => render({ data: Big(5), isLoading: false }),
}))

vi.mock('@/components/IconButton/InfoIconButton', () => ({
  InfoIconButton: () => null,
}))

const position = (stRif: string, backing: string): AbiBoostPositionState => {
  const stRifBalance = parseEther(stRif)
  const backingWei = parseEther(backing)
  const status =
    backingWei >= parseEther('100000')
      ? 'active'
      : stRifBalance >= parseEther('100000')
        ? 'eligible'
        : 'notEligible'
  return { stRifBalance, backing: backingWei, status, isReady: true }
}

beforeEach(() => {
  mockPush.mockReset()
  mockBuildersUnderVote.mockReturnValue([])
  sessionStorage.clear()
})

afterEach(cleanup)

describe('AbiBoostBanner', () => {
  it.each([
    [
      'notEligible',
      position('10000', '0'),
      'Back Builders, earn more',
      'Put 100,000 stRIF or more behind Builders and your rate jumps by 7.5%.',
    ],
    [
      'eligible',
      position('255000', '0'),
      "You're eligible for the boost",
      'Back Builders with 100,000 stRIF or more and the +7.5% boost switches on for 12 months.',
    ],
    [
      'active',
      position('255000', '150000'),
      'Congrats, your 7.5% boost is active',
      'It runs for as long as 100,000 stRIF keeps backing Builders.',
    ],
  ])('tells a %s wallet where it stands', (_, state, title, description) => {
    mockPosition.mockReturnValue(state)
    render(<AbiBoostBanner />)
    expect(screen.getByText(title)).toBeDefined()
    expect(screen.getByTestId('NotificationDescription').textContent).toBe(description)
  })

  it('sends the backer to pick Builders and can be dismissed', () => {
    mockPosition.mockReturnValue(position('255000', '0'))
    render(<AbiBoostBanner />)
    fireEvent.click(screen.getByText('Choose a Builder'))
    expect(mockPush).toHaveBeenCalledWith('/builders')

    fireEvent.click(screen.getByTestId('DismissNotificationButton'))
    expect(screen.queryByTestId('NotificationBanner')).toBeNull()
  })

  it('stays dismissed when the page remounts, but still announces a boost that switches on', () => {
    mockPosition.mockReturnValue(position('255000', '0'))
    const { unmount } = render(<AbiBoostBanner />)
    fireEvent.click(screen.getByTestId('DismissNotificationButton'))
    unmount()

    const { rerender } = render(<AbiBoostBanner />)
    expect(screen.queryByTestId('NotificationBanner')).toBeNull()

    mockPosition.mockReturnValue(position('255000', '150000'))
    rerender(<AbiBoostBanner />)
    expect(screen.getByText('Congrats, your 7.5% boost is active')).toBeDefined()
  })
})

describe('before the position is known', () => {
  it('renders neither the banner nor the card, instead of guessing a status', () => {
    mockPosition.mockReturnValue({ ...position('255000', '150000'), isReady: false })
    const { container } = render(
      <>
        <AbiBoostBanner />
        <BoostedRateCard />
      </>,
    )
    expect(container.innerHTML).toBe('')
  })
})

describe('DeactivationVoteBanners', () => {
  const underVote: BackedBuilderUnderVote[] = [
    {
      builder: '0x1111111111111111111111111111111111111111',
      builderName: 'Beexo',
      proposalId: '1',
      secondsLeft: 3 * 86_400 + 4 * 3_600,
    },
    {
      builder: '0x2222222222222222222222222222222222222222',
      builderName: 'Steer',
      proposalId: '2',
      secondsLeft: 5 * 86_400,
    },
  ]

  it('warns about each backed Builder under a deactivation vote, with the time left', () => {
    mockBuildersUnderVote.mockReturnValue(underVote)
    render(<DeactivationVoteBanners />)

    expect(screen.getByText('Beexo is under a deactivation vote')).toBeDefined()
    expect(screen.getByText('Steer is under a deactivation vote')).toBeDefined()
    expect(screen.getAllByTestId('NotificationDescription')[0].textContent).toBe(
      'Voting ends in 3d 04h 00m. If it passes, backing this Builder stops earning. Reallocate before then to keep your rewards active.',
    )
  })

  it('sends the backer to reallocate, and dismisses one warning at a time', () => {
    mockBuildersUnderVote.mockReturnValue(underVote)
    render(<DeactivationVoteBanners />)

    fireEvent.click(screen.getAllByText('Reallocate now')[0])
    expect(mockPush).toHaveBeenCalledWith('/builders')

    fireEvent.click(screen.getAllByTestId('DismissNotificationButton')[0])
    expect(screen.queryByText('Beexo is under a deactivation vote')).toBeNull()
    expect(screen.getByText('Steer is under a deactivation vote')).toBeDefined()
  })

  it('keeps a dismissed warning away when the page remounts', () => {
    mockBuildersUnderVote.mockReturnValue(underVote)
    const { unmount } = render(<DeactivationVoteBanners />)
    fireEvent.click(screen.getAllByTestId('DismissNotificationButton')[0])
    unmount()

    render(<DeactivationVoteBanners />)
    expect(screen.queryByText('Beexo is under a deactivation vote')).toBeNull()
    expect(screen.getByText('Steer is under a deactivation vote')).toBeDefined()
  })

  it('renders nothing when no backed Builder is under a vote', () => {
    render(<DeactivationVoteBanners />)
    expect(screen.queryByTestId('NotificationBanner')).toBeNull()
  })
})

describe('BoostedRateCard', () => {
  it('shows a backing just under the minimum as eligible, below the threshold, and what it lacks', () => {
    mockPosition.mockReturnValue(position('255135', '99502'))
    render(<BoostedRateCard />)

    expect(screen.getByTestId('BoostedRateStatus').textContent).toBe('Eligible, not active')
    expect(screen.getByTestId('BelowThresholdTag')).toBeDefined()
    expect(screen.getByTestId('ParagraphBoostedRateMessage').textContent).toBe(
      'Back 498 stRIF more to reach the 100,000 stRIF minimum and switch the boost on.',
    )
    fireEvent.click(screen.getByTestId('BoostedRateBackBuilder'))
    expect(mockPush).toHaveBeenCalledWith('/builders')
  })

  it('tells a staked wallet that is not backing how to switch the boost on', () => {
    mockPosition.mockReturnValue(position('255000', '0'))
    render(<BoostedRateCard />)

    expect(screen.getByTestId('BoostedRateStatus').textContent).toBe('Eligible, not active')
    expect(screen.getByTestId('ParagraphBoostedRateMessage').textContent).toBe(
      "Your 255,000 stRIF is staked but not backing. Back Builders with 100,000 stRIF or more and you'd earn +7.5% on top of the current ABI.",
    )
    expect(screen.getByTestId('BoostedRateBackBuilder')).toBeDefined()
  })

  it('shows the terms as the design lists them', () => {
    mockPosition.mockReturnValue(position('255000', '150000'))
    render(<BoostedRateCard />)

    const card = screen.getByTestId('BoostedRateCard').textContent
    expect(screen.getByTestId('BoostedRateStatus').textContent).toBe('Active')
    expect(card).toContain('Term12 months')
    expect(card).toContain('Minimum100,000 stRIF')
    expect(card).toContain('RequirementThe minimum must be backing Builders')
    expect(screen.queryByTestId('BelowThresholdTag')).toBeNull()
  })

  it('asks a wallet short of stRIF to stake what it lacks', () => {
    mockPosition.mockReturnValue(position('10035', '2951'))
    render(<BoostedRateCard />)

    expect(screen.getByTestId('BoostedRateStatus').textContent).toBe('Not eligible')
    expect(screen.getByTestId('BelowThresholdTag')).toBeDefined()
    expect(screen.getByTestId('ParagraphBoostedRateMessage').textContent).toContain('Stake 89,965 stRIF more')
    expect(screen.queryByTestId('BoostedRateBackBuilder')).toBeNull()
  })
})

describe('BackingBoostHintView', () => {
  it('announces the boost when the edit crosses the minimum', () => {
    render(<BackingBoostHintView current={parseEther('50000')} next={parseEther('101800')} />)
    expect(screen.getByTestId('BoostPill').textContent).toBe('This backing is eligible for a boost · +7.5%')
  })

  it('tells what the edit still lacks', () => {
    render(<BackingBoostHintView current={0n} next={parseEther('97300')} />)
    expect(screen.getByTestId('BackingBoostHintText').textContent).toBe('2,700 stRIF to boost this backing')
  })

  it('tags a saved backing under the minimum', () => {
    render(<BackingBoostHintView current={parseEther('2951')} next={parseEther('2951')} />)
    expect(screen.getByTestId('BelowThresholdTag').textContent).toBe(
      'Below eligibility threshold, not earning boost',
    )
  })

  it('says nothing without a backing', () => {
    const { container } = render(<BackingBoostHintView current={0n} next={0n} />)
    expect(container.innerHTML).toBe('')
  })
})

describe('DrawerBoostSummary', () => {
  it('shows the boost and the rate the save would earn', () => {
    render(<DrawerBoostSummaryView current={parseEther('50000')} next={parseEther('101800')} />)
    const summary = screen.getByTestId('DrawerBoostSummary').textContent
    expect(summary).toContain('Boost on this backing +7.5% for 12 months')
    expect(summary).toContain('Rate on this backing 12.5%')
  })

  it('warns when the save takes the backing under the minimum', () => {
    render(<DrawerBoostSummaryView current={parseEther('150000')} next={parseEther('90000')} />)
    expect(screen.getByTestId('DrawerBoostSummary').textContent).toBe(
      'Under 100,000 stRIF, this backing stops earning the boost',
    )
  })

  it('stays out of the way for a saved backing that does not change', () => {
    const { container } = render(
      <DrawerBoostSummaryView current={parseEther('2951')} next={parseEther('2951')} />,
    )
    expect(container.innerHTML).toBe('')
  })
})
