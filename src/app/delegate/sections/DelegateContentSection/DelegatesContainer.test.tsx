import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { DelegatesContainer } from './DelegatesContainer'

vi.mock('wagmi', () => ({ useReadContract: () => ({ data: undefined }) }))
vi.mock('@/app/user/Delegation/hooks/useNftHoldersWithVotingPower', () => ({
  useNftHoldersWithVotingPower: () => ({ nftHolders: [] }),
}))

const renderContainer = (props: { hasOtherDelegatee?: boolean; isClosable?: boolean } = {}) => {
  const onCloseClick = vi.fn()
  render(
    <DelegatesContainer
      hasOtherDelegatee={props.hasOtherDelegatee ?? false}
      isClosable={props.isClosable ?? false}
      onDelegate={vi.fn()}
      onCloseClick={onCloseClick}
    />,
  )
  return { onCloseClick }
}

describe('DelegatesContainer', () => {
  afterEach(cleanup)

  it('can be closed when it was opened on demand', () => {
    const { onCloseClick } = renderContainer({ isClosable: true })

    fireEvent.click(screen.getByTestId('closeDelegatesContainer'))

    expect(onCloseClick).toHaveBeenCalledTimes(1)
  })

  it('has no close icon when it stays open', () => {
    renderContainer({ isClosable: false })

    expect(screen.queryByTestId('closeDelegatesContainer')).not.toBeInTheDocument()
  })

  it('asks for a first delegate when nobody else holds the voting power', () => {
    renderContainer({ isClosable: true })

    expect(screen.getByText('Input delegate to make governance decisions on your behalf')).toBeInTheDocument()
    expect(screen.getByTestId('delegateButton')).toHaveTextContent('Delegate')
    expect(screen.getByTestId('delegateButton')).not.toHaveTextContent('Update delegate')
  })

  it('asks for a new delegate when the voting power is delegated to someone else', () => {
    renderContainer({ hasOtherDelegatee: true, isClosable: true })

    expect(screen.getByText('Input a new delegate for your voting power')).toBeInTheDocument()
    expect(screen.getByTestId('delegateButton')).toHaveTextContent('Update delegate')
  })
})
