import { describe, expect, test } from 'vitest'
import { getDiscourseLinkFromProposalDescription, DISCOURSE_LINK_SEPARATOR } from './utils' // adjust import path

describe('getDiscourseLinkFromProposalDescription', () => {
  test('should return undefined when description does not contain DiscourseLink:', () => {
    const description = 'This is a proposal description without any discourse links'

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBeUndefined()
  })

  test('should extract link when DiscourseLink: is present and followed by text ending with space', () => {
    const description =
      'This is a proposal DiscourseLink:https://discourse.example.com/topic/123 and some more text'

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe('https://discourse.example.com/topic/123 and some more')
  })

  test('should extract link when DiscourseLink: is at the end of description with no trailing space', () => {
    const description = 'This is a proposal DiscourseLink:https://discourse.example.com/topic/456'

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe('https://discourse.example.com/topic/456')
  })

  test('should handle DiscourseLink: with extra whitespace around the link', () => {
    const description =
      'Proposal text DiscourseLink:   https://discourse.example.com/topic/789   more text here'

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe('https://discourse.example.com/topic/789   more text')
  })

  test('should return empty string when DiscourseLink: is followed immediately by space', () => {
    const description = 'Proposal DiscourseLink: and then more text'

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe('and then more')
  })

  test('should extract everything up to the last space in the entire description', () => {
    const description = 'Start DiscourseLink:https://discourse.example.com/some/long/path middle text final'

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe('https://discourse.example.com/some/long/path middle text')
  })

  test('should find first occurrence of DiscourseLink: when multiple exist', () => {
    const description =
      'First DiscourseLink:https://first.com and second DiscourseLink:https://second.com end'

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe('https://first.com and second DiscourseLink:https://second.com')
  })

  test('should handle case where DiscourseLink: is immediately followed by the last space', () => {
    const description = 'Some text DiscourseLink: '

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe('')
  })

  test('should extract content when there are multiple spaces after DiscourseLink:', () => {
    const description = 'Proposal DiscourseLink:link-content with multiple words final'

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe('link-content with multiple words')
  })
})
