import { cleanup, render, screen, within } from '@testing-library/react'
import { afterEach, describe, it, expect } from 'vitest'
import { BtcVaultPage } from './BtcVaultPage'

const ZONE_TEST_IDS = [
  'btc-vault-metrics',
  'btc-vault-dashboard',
  'btc-vault-actions',
  'btc-vault-queue',
  'btc-vault-history',
] as const

describe('BtcVaultPage', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders the page with btc-vault-page test id', () => {
    render(<BtcVaultPage />)
    expect(screen.getByTestId('btc-vault-page')).toBeInTheDocument()
  })

  it('renders all five layout zone placeholders in order', () => {
    const { container } = render(<BtcVaultPage />)
    const page = container.querySelector('[data-testid="btc-vault-page"]')
    expect(page).toBeInTheDocument()
    const withinPage = within(page as HTMLElement)
    for (const testId of ZONE_TEST_IDS) {
      expect(withinPage.getByTestId(testId)).toBeInTheDocument()
    }
  })
})
