import { describe, expect, it } from 'vitest'

import { selectBannerConfigs } from './configs'
import { BANNER_CONFIGS, CYCLE_ENDED, CYCLE_ENDING, KYC_ONLY, NOT_BACKING, STACK_ARTWORK } from './constants'
import { BannerConfig } from './types'

const banner = (id: string): BannerConfig => ({
  id,
  title: id,
  description: id,
  buttonText: id,
  action: { url: `/${id}`, external: false },
})

const ids = (configs: BannerConfig[]) => configs.map(({ id }) => id)

describe('selectBannerConfigs', () => {
  it('leaves a single notification alone', () => {
    const only = [banner(KYC_ONLY)]

    expect(selectBannerConfigs(only)).toEqual(only)
  })

  it('leads with the cycle and puts backing under it, whatever order they arrive in', () => {
    const selected = selectBannerConfigs([banner(KYC_ONLY), banner(NOT_BACKING), banner(CYCLE_ENDED)])

    expect(ids(selected)).toEqual([CYCLE_ENDED, NOT_BACKING])
  })

  it('keeps unranked notifications in the order the detection functions produced', () => {
    const selected = selectBannerConfigs([banner('NEED_RIF'), banner('NEED_STRIF'), banner(KYC_ONLY)])

    expect(ids(selected)).toEqual(['NEED_RIF', 'NEED_STRIF'])
  })

  it('shows one cycle notification at a time, so the stack is not spent on one piece of news', () => {
    const selected = selectBannerConfigs([
      banner(CYCLE_ENDING),
      banner(CYCLE_ENDED),
      banner(NOT_BACKING),
    ])

    expect(ids(selected)).toEqual([CYCLE_ENDED, NOT_BACKING])
  })

  it('holds one card per artwork, so every card has a look of its own', () => {
    const selected = selectBannerConfigs([
      banner(CYCLE_ENDED),
      banner(NOT_BACKING),
      banner(KYC_ONLY),
      banner('NEED_RIF'),
    ])

    expect(selected).toHaveLength(STACK_ARTWORK.length)
  })

  it('leaves the array it was handed untouched', () => {
    const configs = [banner(KYC_ONLY), banner(CYCLE_ENDED)]

    selectBannerConfigs(configs)

    expect(ids(configs)).toEqual([KYC_ONLY, CYCLE_ENDED])
  })
})

/**
 * The card is a fixed 132px so a stack of them stays even, which leaves room for a title and
 * four lines of copy — three if the title itself wraps. The narrowest the copy column gets on
 * desktop is around 474px, or some 63 characters a line, so three lines is roughly 190
 * characters. This cap sits under that with room for a translation to run long, and it is
 * here rather than in review because the card clips silently.
 */
const DESCRIPTION_LIMIT = 180

const entries = Object.entries(BANNER_CONFIGS)

describe('BANNER_CONFIGS', () => {
  it.each(entries)('describes %s', (_, { description }) => {
    expect(description).toBeTruthy()
  })

  /*
   * `description` is a ReactNode, and a config is free to use JSX the way `title` already
   * does. Only the plain strings can be measured here, so those are the ones checked —
   * a JSX description is left to review rather than failing this test for the wrong reason.
   */
  const measurable = entries.filter(([, { description }]) => typeof description === 'string')

  it.each(measurable)('keeps %s short enough that the card does not clip it', (_, { description }) => {
    expect(String(description).length).toBeLessThanOrEqual(DESCRIPTION_LIMIT)
  })
})
