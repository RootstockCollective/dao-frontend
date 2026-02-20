import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { BtcVaultPage } from './BtcVaultPage'

describe('BtcVaultPage', () => {
  it('renders the page with btc-vault-page test id', () => {
    render(<BtcVaultPage />)
    expect(screen.getByTestId('btc-vault-page')).toBeInTheDocument()
  })
})
