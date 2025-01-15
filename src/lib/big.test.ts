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
