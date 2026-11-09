import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'

import { withDataFallback } from './withDataFallback'

const usePrimary = () => ({ data: 5, isLoading: false })
const useFallback = () => ({ data: 0, isLoading: false })

const Loader = withDataFallback<number>(usePrimary, useFallback)

const Counter = ({ data }: { data: number }) => {
  const [clicks, setClicks] = useState(0)

  return (
    <button type="button" onClick={() => setClicks(clicks + 1)}>
      {data}:{clicks}
    </button>
  )
}

const Parent = () => {
  const [renders, setRenders] = useState(0)

  return (
    <>
      <button type="button" onClick={() => setRenders(renders + 1)}>
        rerender
      </button>
      <Loader render={({ data }) => <Counter data={data} />} />
    </>
  )
}

describe('withDataFallback', () => {
  afterEach(cleanup)

  it('keeps the rendered subtree mounted when the parent re-renders', () => {
    render(<Parent />)

    fireEvent.click(screen.getByText('5:0'))
    fireEvent.click(screen.getByText('rerender'))

    expect(screen.getByText('5:1')).toBeInTheDocument()
  })
})
