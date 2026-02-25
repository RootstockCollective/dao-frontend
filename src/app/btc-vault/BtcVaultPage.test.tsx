import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { BtcVaultPage } from './BtcVaultPage'

describe('BtcVaultPage', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the page container', () => {
    render(<BtcVaultPage />)
    expect(screen.getByTestId('BTC Vault')).toBeInTheDocument()
  })

  it('renders all layout zone placeholders', () => {
    render(<BtcVaultPage />)
    expect(screen.getByTestId('btc-vault-metrics')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-actions')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-request-queue')).toBeInTheDocument()
    expect(screen.getByTestId('btc-vault-history')).toBeInTheDocument()
  })
})
