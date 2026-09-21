import { describe, expect, it } from 'vitest'

import { selectBannerConfigs } from './configs'
import { CYCLE_ENDED, CYCLE_ENDING, KYC_ONLY, NOT_BACKING, STACK_ARTWORK } from './constants'
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
