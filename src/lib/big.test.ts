import Big from '@/lib/big'
import { describe, expect, it } from 'vitest'

describe('max', () => {
  it('max with 1, 2, 3', () => {
    expect(Big.max(Big(1), Big(2), Big(3)).toString()).eq('3')
  })
  it('max with 3, 2, 1', () => {
    expect(Big.max(Big(3), Big(2), Big(1)).toString()).eq('3')
  })
  it('max with 1, 3, 2', () => {
    expect(Big.max(Big(1), Big(3), Big(2)).toString()).eq('3')
  })
  it('max with 1', () => {
    expect(Big.max(Big(1)).toString()).eq('1')
  })
})

describe('ceil', () => {
  it('ceil with 1.1', () => {
    expect(Math.ceil(1.1)).eq(2)
    expect(Big(1.1).ceil().toString()).eq('2')
  })
  it('ceil with 1.9', () => {
    expect(Math.ceil(1.9)).eq(2)
    expect(Big(1.9).ceil().toString()).eq('2')
  })
  it('ceil with 1.0', () => {
    expect(Math.ceil(1.0)).eq(1)
    expect(Big(1.0).ceil().toString()).eq('1')
  })
  it('ceil with 0.1', () => {
    expect(Math.ceil(0.1)).eq(1)
    expect(Big(0.1).ceil().toString()).eq('1')
  })
  it('ceil with negative', () => {
    expect(Math.ceil(-1.1)).eq(-1)
    expect(Big(-1.1).ceil().toString()).eq('-1')
  })
})

describe('roundHalfEven', () => {
  it('roundHalfEven with 1.5 should be 2', () => {
    const number = 1.55
    expect(Math.round(number)).eq(2)
    expect(Big(number).roundHalfEven().toString()).eq('2')
  })

  it('roundHalfEven with 3.45 should be 3', () => {
    const number = 3.45
    expect(Math.round(number)).eq(3)
    expect(Big(number).roundHalfEven().toString()).eq('3')
  })

  it('roundHalfEven with 3.5 should be 4', () => {
    const number = 3.5
    expect(Math.round(number)).eq(4)
    expect(Big(number).roundHalfEven().toString()).eq('4')
  })
})

describe('floor', () => {
  it('floor with 1.55 should be 1', () => {
    const number = 1.55
    expect(Math.floor(number)).eq(1)
    expect(Big(number).floor().toString()).eq('1')
  })

  it('floor with 1.99 should be 1', () => {
    const number = 1.99
    expect(Math.floor(number)).eq(1)
    expect(Big(number).floor().toString()).eq('1')
  })

  it('floor with 2.01 should be 1', () => {
    const number = 2.01
    expect(Math.floor(number)).eq(2)
    expect(Big(number).floor().toString()).eq('2')
  })
})
