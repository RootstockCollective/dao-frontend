import { describe, expect, test } from 'vitest'
import { getDiscourseLinkFromProposalDescription } from './utils' // adjust import path

describe('getDiscourseLinkFromProposalDescription', () => {
  test('should return undefined when description does not contain DiscourseLink:', () => {
    const description = 'This is a proposal description without any discourse links'

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBeUndefined()
  })

  test('should extract only the URL when DiscourseLink: is followed by space and more text', () => {
    const description =
      'This is a proposal DiscourseLink:https://discourse.example.com/topic/123 and some more text'

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe('https://discourse.example.com/topic/123')
  })

  test('should extract link when DiscourseLink: is at the end of description with no trailing space', () => {
    const description = 'This is a proposal DiscourseLink:https://discourse.example.com/topic/456'

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe('https://discourse.example.com/topic/456')
  })

  test('should extract only the URL when there is extra whitespace before the first space', () => {
    const description = 'Proposal text DiscourseLink:https://discourse.example.com/topic/789 more text here'

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe('https://discourse.example.com/topic/789')
  })

  test('should return empty string when DiscourseLink: is followed immediately by space', () => {
    const description = 'Proposal DiscourseLink: and then more text'

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe('')
  })

  test('should extract only URL up to first space, not including subsequent text', () => {
    const description = 'Start DiscourseLink:https://discourse.example.com/some/long/path middle text final'

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe('https://discourse.example.com/some/long/path')
  })

  test('should find first occurrence of DiscourseLink: and extract only that URL', () => {
    const description =
      'First DiscourseLink:https://first.com and second DiscourseLink:https://second.com end'

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe('https://first.com')
  })

  test('should handle case where DiscourseLink: is immediately followed by space at end', () => {
    const description = 'Some text DiscourseLink: '

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe('')
  })

  test('should extract only URL when link is followed by milestone text', () => {
    const description = 'Proposal DiscourseLink:https://gov.rootstock.xyz/t/123 Milestone1'

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe('https://gov.rootstock.xyz/t/123')
  })

  test('should extract only the first word after DiscourseLink:', () => {
    const description = 'Proposal DiscourseLink:link-content with multiple words final'

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe('link-content')
  })
})
