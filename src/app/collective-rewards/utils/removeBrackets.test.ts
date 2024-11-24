import { describe, it, expect } from 'vitest'
import { removeBrackets } from './removeBrackets'

describe('formatBuilderName', () => {
  it('should remove the initial text enclosed with []', () => {
    const input = '[Initial Text] Remaining Text'
    const expectedOutput = 'Remaining Text'
    expect(removeBrackets(input)).toBe(expectedOutput)
  })

  it('should return the same string if no text is enclosed with []', () => {
    const input = 'No brackets here'
    const expectedOutput = 'No brackets here'
    expect(removeBrackets(input)).toBe(expectedOutput)
  })

  it('should handle strings with multiple brackets correctly', () => {
    const input = '[Initial] [Text] Remaining Text'
    const expectedOutput = '[Text] Remaining Text'
    expect(removeBrackets(input)).toBe(expectedOutput)
  })

  it('should not remove the chars after the bracket if it is not an empty space', () => {
    const input = '[Initial][Text] Remaining Text'
    const expectedOutput = '[Text] Remaining Text'
    expect(removeBrackets(input)).toBe(expectedOutput)
  })

  it('should handle empty strings correctly', () => {
    const input = ''
    const expectedOutput = ''
    expect(removeBrackets(input)).toBe(expectedOutput)
  })

  it('should handle strings with only brackets correctly', () => {
    const input = '[]'
    const expectedOutput = ''
    expect(removeBrackets(input)).toBe(expectedOutput)
  })

  it('should handle undefined also', () => {
    const input = undefined
    const expectedOutput = ''
    expect(removeBrackets(input)).toBe(expectedOutput)
  })
})
