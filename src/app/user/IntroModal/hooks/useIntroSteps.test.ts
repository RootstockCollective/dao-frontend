import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { INTRO_STEP_GAS, INTRO_STEP_RIF, INTRO_STEP_SUMMARY, useIntroSteps } from './useIntroSteps'

describe('useIntroSteps', () => {
  describe('step list composition', () => {
    it('builds three steps when the user is missing both RIF and gas', () => {
      const { result } = renderHook(() => useIntroSteps({ needsRif: true, needsGas: true }))

      expect(result.current.steps.map(step => step.id)).toEqual([
        INTRO_STEP_RIF,
        INTRO_STEP_GAS,
        INTRO_STEP_SUMMARY,
      ])
      expect(result.current.totalSteps).toBe(3)
    })

    it('drops the gas step when the user already has gas', () => {
      const { result } = renderHook(() => useIntroSteps({ needsRif: true, needsGas: false }))

      expect(result.current.steps.map(step => step.id)).toEqual([INTRO_STEP_RIF, INTRO_STEP_SUMMARY])
      expect(result.current.totalSteps).toBe(2)
    })

    it('drops the RIF step when the user already has RIF', () => {
      const { result } = renderHook(() => useIntroSteps({ needsRif: false, needsGas: true }))

      expect(result.current.steps.map(step => step.id)).toEqual([INTRO_STEP_GAS, INTRO_STEP_SUMMARY])
      expect(result.current.totalSteps).toBe(2)
    })

    it('is a single summary step when nothing is missing', () => {
      const { result } = renderHook(() => useIntroSteps({ needsRif: false, needsGas: false }))

      expect(result.current.steps.map(step => step.id)).toEqual([INTRO_STEP_SUMMARY])
      expect(result.current.totalSteps).toBe(1)
      expect(result.current.isFirstStep).toBe(true)
      expect(result.current.isLastStep).toBe(true)
    })

    it('starts on the first step', () => {
      const { result } = renderHook(() => useIntroSteps({ needsRif: true, needsGas: true }))

      expect(result.current.currentIndex).toBe(0)
      expect(result.current.currentStep.id).toBe(INTRO_STEP_RIF)
      expect(result.current.isFirstStep).toBe(true)
      expect(result.current.isLastStep).toBe(false)
    })
  })

  describe('navigation', () => {
    it('advances one step at a time', () => {
      const { result } = renderHook(() => useIntroSteps({ needsRif: true, needsGas: true }))

      act(() => result.current.goNext())
      expect(result.current.currentStep.id).toBe(INTRO_STEP_GAS)

      act(() => result.current.goNext())
      expect(result.current.currentStep.id).toBe(INTRO_STEP_SUMMARY)
      expect(result.current.isLastStep).toBe(true)
    })

    it('does not advance past the last step', () => {
      const { result } = renderHook(() => useIntroSteps({ needsRif: false, needsGas: false }))

      act(() => result.current.goNext())
      expect(result.current.currentIndex).toBe(0)
    })

    it('steps back one position', () => {
      const { result } = renderHook(() => useIntroSteps({ needsRif: true, needsGas: true }))

      act(() => result.current.goNext())
      act(() => result.current.goBack())

      expect(result.current.currentStep.id).toBe(INTRO_STEP_RIF)
    })

    it('does not step back past the first step', () => {
      const { result } = renderHook(() => useIntroSteps({ needsRif: true, needsGas: true }))

      act(() => result.current.goBack())
      expect(result.current.currentIndex).toBe(0)
    })
  })

  describe('balances changing mid-flow', () => {
    it('keeps the step list frozen when a balance lands', () => {
      const { result, rerender } = renderHook(props => useIntroSteps(props), {
        initialProps: { needsRif: true, needsGas: true },
      })

      rerender({ needsRif: false, needsGas: true })

      expect(result.current.steps.map(step => step.id)).toEqual([
        INTRO_STEP_RIF,
        INTRO_STEP_GAS,
        INTRO_STEP_SUMMARY,
      ])
      expect(result.current.totalSteps).toBe(3)
    })

    it('marks the satisfied step as done', () => {
      const { result, rerender } = renderHook(props => useIntroSteps(props), {
        initialProps: { needsRif: true, needsGas: true },
      })

      expect(result.current.steps[0].isDone).toBe(false)

      rerender({ needsRif: false, needsGas: true })

      expect(result.current.steps[0].isDone).toBe(true)
      expect(result.current.steps[1].isDone).toBe(false)
    })

    it('does not auto-advance off a step that became done', () => {
      const { result, rerender } = renderHook(props => useIntroSteps(props), {
        initialProps: { needsRif: true, needsGas: true },
      })

      rerender({ needsRif: false, needsGas: true })

      expect(result.current.currentStep.id).toBe(INTRO_STEP_RIF)
      expect(result.current.currentStep.isDone).toBe(true)
    })

    it('skips a satisfied step on goNext', () => {
      const { result, rerender } = renderHook(props => useIntroSteps(props), {
        initialProps: { needsRif: true, needsGas: true },
      })

      // User buys RIF and tops up gas from the first step, in the same trip.
      rerender({ needsRif: true, needsGas: false })

      act(() => result.current.goNext())

      expect(result.current.currentStep.id).toBe(INTRO_STEP_SUMMARY)
      expect(result.current.currentIndex).toBe(2)
    })

    it('never treats the summary step as done', () => {
      const { result } = renderHook(() => useIntroSteps({ needsRif: false, needsGas: false }))

      expect(result.current.steps[0].isDone).toBe(false)
    })

    it('allows stepping back onto a step that is already done', () => {
      const { result, rerender } = renderHook(props => useIntroSteps(props), {
        initialProps: { needsRif: true, needsGas: true },
      })

      act(() => result.current.goNext())
      rerender({ needsRif: false, needsGas: true })
      act(() => result.current.goBack())

      expect(result.current.currentStep.id).toBe(INTRO_STEP_RIF)
      expect(result.current.currentStep.isDone).toBe(true)
    })
  })
})
