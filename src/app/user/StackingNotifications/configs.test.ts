import { describe, expect, it } from 'vitest'

import { NEED_RIF, NEED_STRIF } from '@/app/user/IntroModal/hooks/useRequiredTokens'

import { selectBannerConfigs } from './configs'
import {
  BANNER_CONFIGS,
  CYCLE_ENDED,
  CYCLE_ENDING,
  getStackArtwork,
  KYC_ONLY,
  NEED_RBTC_AND_RIF_ID,
  NOT_BACKING,
  STACK_ARTWORK,
  START_BUILDING,
} from './constants'
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

  it('shows every active notification, not just the first two', () => {
    const selected = selectBannerConfigs([
      banner(KYC_ONLY),
      banner(NOT_BACKING),
      banner(CYCLE_ENDED),
      banner(NEED_RBTC_AND_RIF_ID),
    ])

    expect(selected).toHaveLength(4)
  })

  it('leads with the prerequisites, then the cycle, backing and the builder status', () => {
    const selected = selectBannerConfigs([
      banner(START_BUILDING),
      banner(NOT_BACKING),
      banner(CYCLE_ENDED),
      banner(NEED_RBTC_AND_RIF_ID),
    ])

    expect(ids(selected)).toEqual([NEED_RBTC_AND_RIF_ID, CYCLE_ENDED, NOT_BACKING, START_BUILDING])
  })

  it('never lets the cycle hide a missing token, which blocks every other action', () => {
    for (const tokenId of [NEED_RBTC_AND_RIF_ID, NEED_RIF, NEED_STRIF]) {
      const selected = selectBannerConfigs([banner(CYCLE_ENDING), banner(NOT_BACKING), banner(tokenId)])

      expect(ids(selected)[0]).toBe(tokenId)
    }
  })

  it('keeps unranked notifications last, in the order the detection functions produced', () => {
    const selected = selectBannerConfigs([banner('NEW_A'), banner(KYC_ONLY), banner('NEW_B')])

    expect(ids(selected)).toEqual([KYC_ONLY, 'NEW_A', 'NEW_B'])
  })

  it('shows one cycle notification at a time, so the stack does not tell the same news twice', () => {
    const selected = selectBannerConfigs([banner(CYCLE_ENDING), banner(CYCLE_ENDED), banner(NOT_BACKING)])

    expect(ids(selected)).toEqual([CYCLE_ENDED, NOT_BACKING])
  })

  it('leaves the array it was handed untouched', () => {
    const configs = [banner(KYC_ONLY), banner(CYCLE_ENDED)]

    selectBannerConfigs(configs)

    expect(ids(configs)).toEqual([KYC_ONLY, CYCLE_ENDED])
  })
})

describe('getStackArtwork', () => {
  it('alternates the artwork down the stack, so neighbouring cards never look the same', () => {
    const looks = [0, 1, 2, 3, 4].map(getStackArtwork)

    looks.slice(1).forEach((look, index) => {
      expect(look).not.toBe(looks[index])
    })
    expect(looks[STACK_ARTWORK.length]).toBe(looks[0])
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
