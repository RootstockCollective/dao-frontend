import { describe, expect, it } from 'vitest'

import { attachApy, type EpochSettledEventDto } from './action'

function baseDto(overrides: Partial<EpochSettledEventDto>): EpochSettledEventDto {
  return {
    epochId: '0',
    reportedOffchainAssets: '0',
    assets: '0',
    supply: '0',
    closedAt: '0',
    apy: null,
    ...overrides,
  }
}

describe('attachApy', () => {
  it('returns empty array for empty input', () => {
    expect(attachApy([])).toEqual([])
  })

  it('leaves apy null on the oldest (only) row', () => {
    const dtos: EpochSettledEventDto[] = [baseDto({ epochId: '1', assets: '1000', supply: '1000', closedAt: '1500000' })]
    const result = attachApy(dtos)
    expect(result).toHaveLength(1)
    expect(result[0].apy).toBeNull()
  })

  it('compounds per-period share-price ratios into apy for 3 consecutive epochs', () => {
    // 3 epochs, descending, synthetic small-integer data (100000s-second epochs).
    // Expected apy values computed offline from computeIndicativeApy:
    //   row 0: priceRatio = (3000/2800) / (2000/1900) ≈ 1.01786, elapsed = 100000s,
    //          apy = 1.01786^(31557600/100000) - 1 ≈ 265.55 (i.e. 26555%; synthetic data).
    //   row 1: priceRatio = (2000/1900) / (1000/1000) ≈ 1.0526, elapsed = 100000s,
    //          apy = 1.0526^315.576 - 1 ≈ 1.07e7 (extreme; synthetic data).
    const dtos: EpochSettledEventDto[] = [
      baseDto({ epochId: '3', assets: '3000', supply: '2800', closedAt: '1700000' }),
      baseDto({ epochId: '2', assets: '2000', supply: '1900', closedAt: '1600000' }),
      baseDto({ epochId: '1', assets: '1000', supply: '1000', closedAt: '1500000' }),
    ]
    const result = attachApy(dtos)
    expect(result).toHaveLength(3)
    expect(result[0].apy).toBeCloseTo(265.55, 1)
    expect(result[1].apy).toBeCloseTo(10712614.99, -2)
    expect(result[2].apy).toBeNull()
  })

  it('returns null apy when prior epoch is bootstrap (zero supply)', () => {
    // Real-world bootstrap: epoch 1 has zero supply, epoch 2 is the first real deposit.
    // computeIndicativeApy guards supplyAtClose === 0n and returns null — so the newer
    // row gets null apy (no meaningful yield baseline), and the oldest is null by rule.
    const dtos: EpochSettledEventDto[] = [
      baseDto({
        epochId: '2',
        assets: '191188999214597',
        supply: '191188999214597000000',
        closedAt: '1776242196',
      }),
      baseDto({
        epochId: '1',
        assets: '0',
        supply: '0',
        closedAt: '1774988172',
      }),
    ]
    const result = attachApy(dtos)
    expect(result[0].apy).toBeNull()
    expect(result[1].apy).toBeNull()
  })

  it('compounds 14-day share-price growth into ≈21.69% and ≈4.17% apy', () => {
    // Supply fixed at 1.91189e20, assets grow each 14.5-day (~1254024s) epoch.
    //   row 0 (epoch 3 vs 2): priceRatio ≈ 193/191.5 ≈ 1.00783, elapsed = 1254024s,
    //          periodsPerYear ≈ 25.164, apy = 1.00783^25.164 - 1 ≈ 0.2169 (21.69%).
    //   row 1 (epoch 2 vs 1): priceRatio ≈ 191500/191188.999... ≈ 1.001626,
    //          apy = 1.001626^25.164 - 1 ≈ 0.0417 (4.17%).
    const dtos: EpochSettledEventDto[] = [
      baseDto({
        epochId: '3',
        assets: '193000000000000',
        supply: '191188999214597000000',
        closedAt: '1777496220',
      }),
      baseDto({
        epochId: '2',
        assets: '191500000000000',
        supply: '191188999214597000000',
        closedAt: '1776242196',
      }),
      baseDto({
        epochId: '1',
        assets: '191188999214597',
        supply: '191188999214597000000',
        closedAt: '1774988172',
      }),
    ]
    const result = attachApy(dtos)
    expect(result[0].apy).toBeCloseTo(0.2169, 3)
    expect(result[1].apy).toBeCloseTo(0.0417, 3)
    expect(result[2].apy).toBeNull()
  })

  it('confines bootstrap null to the next epoch and compounds ≈11.24% apy for the one after', () => {
    // Epoch 1: bootstrap (zeros). Epoch 2: first real deposit. Epoch 3: yield accrued.
    // Expected propagation: only epoch 2 gets null (its prior is bootstrap); epoch 3
    // compares against epoch 2 (both have real supply) and produces a positive apy.
    //   row 0 (epoch 3 vs 2): priceRatio ≈ 192/191.188999... ≈ 1.004242,
    //          elapsed = 1254024s, apy = 1.004242^25.164 - 1 ≈ 0.1124 (11.24%).
    const dtos: EpochSettledEventDto[] = [
      baseDto({
        epochId: '3',
        assets: '192000000000000',
        supply: '191188999214597000000',
        closedAt: '1777496220',
      }),
      baseDto({
        epochId: '2',
        assets: '191188999214597',
        supply: '191188999214597000000',
        closedAt: '1776242196',
      }),
      baseDto({
        epochId: '1',
        assets: '0',
        supply: '0',
        closedAt: '1774988172',
      }),
    ]
    const result = attachApy(dtos)
    expect(result[0].apy).toBeCloseTo(0.1124, 3)
    expect(result[1].apy).toBeNull()
    expect(result[2].apy).toBeNull()
  })

  it('preserves the other DTO fields unchanged', () => {
    const dtos: EpochSettledEventDto[] = [
      baseDto({ epochId: '2', reportedOffchainAssets: '123', assets: '2000', supply: '1900', closedAt: '1600000' }),
      baseDto({ epochId: '1', reportedOffchainAssets: '456', assets: '1000', supply: '1000', closedAt: '1500000' }),
    ]
    const result = attachApy(dtos)
    expect(result[0].epochId).toBe('2')
    expect(result[0].reportedOffchainAssets).toBe('123')
    expect(result[0].assets).toBe('2000')
    expect(result[0].supply).toBe('1900')
    expect(result[0].closedAt).toBe('1600000')
  })
})
