import { ProposalCategory } from '@/shared/types'
import { describe, expect, test } from 'vitest'

import { Milestones } from './types'
import {
  getDiscourseLinkFromProposalDescription,
  getProposalCategoryFromMilestone,
  toTrustedForumLink,
} from './utils'

describe('getDiscourseLinkFromProposalDescription', () => {
  const forum = 'https://gov.rootstockcollective.xyz'

  test('should return undefined when description does not contain DiscourseLink:', () => {
    const description = 'This is a proposal description without any discourse links'

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBeUndefined()
  })

  test('should extract only the URL when DiscourseLink: is followed by space and more text', () => {
    const description = `This is a proposal DiscourseLink:${forum}/t/topic/123 and some more text`

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe(`${forum}/t/topic/123`)
  })

  test('should extract link when DiscourseLink: is at the end of description with no trailing space', () => {
    const description = `This is a proposal DiscourseLink:${forum}/t/topic/456`

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe(`${forum}/t/topic/456`)
  })

  test('should extract only URL up to first space, not including subsequent text', () => {
    const description = `Start DiscourseLink:${forum}/some/long/path middle text final`

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe(`${forum}/some/long/path`)
  })

  test('should return undefined when DiscourseLink: is followed immediately by space', () => {
    const description = 'Proposal DiscourseLink: and then more text'

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBeUndefined()
  })

  test('should find first occurrence of DiscourseLink: and extract only that URL', () => {
    const description = `First DiscourseLink:${forum}/t/1 and second DiscourseLink:${forum}/t/2 end`

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe(`${forum}/t/1`)
  })

  test('should extract only URL when link is followed by milestone text', () => {
    const description = `Proposal DiscourseLink:${forum}/t/123 Milestone1`

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe(`${forum}/t/123`)
  })

  test('should fall back to a forum URL found anywhere in the description', () => {
    const description = `Discussed at ${forum}/t/fallback/9, see there.`

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBe(`${forum}/t/fallback/9`)
  })

  test.each([
    ['another host', 'https://discourse.example.com/topic/123'],
    ['a lookalike host', 'https://gov.rootstockcollective.xyz.evil.example/t/1'],
    ['plain http', 'http://gov.rootstockcollective.xyz/t/1'],
    ['a javascript: URL', 'javascript:alert(document.cookie)'],
    ['a data: URL', 'data:text/html,<script>alert(1)</script>'],
    ['something that is not a URL', 'link-content'],
  ])('should not return a DiscourseLink: pointing at %s', (_, link) => {
    const description = `Proposal DiscourseLink:${link} with multiple words final`

    const result = getDiscourseLinkFromProposalDescription(description)

    expect(result).toBeUndefined()
  })
})

describe('toTrustedForumLink', () => {
  test('keeps an https forum link and drops everything else', () => {
    expect(toTrustedForumLink('https://gov.rootstockcollective.xyz/t/abc/12')).toBe(
      'https://gov.rootstockcollective.xyz/t/abc/12',
    )
    expect(toTrustedForumLink('https://evil.example/t/abc/12')).toBeUndefined()
    expect(toTrustedForumLink('javascript:alert(1)')).toBeUndefined()
    expect(toTrustedForumLink('')).toBeUndefined()
    expect(toTrustedForumLink(undefined)).toBeUndefined()
  })
})

describe('getProposalCategoryFromMilestone', () => {
  test.each([
    [Milestones.MILESTONE_1, ProposalCategory.Milestone1],
    [Milestones.MILESTONE_2, ProposalCategory.Milestone2],
    [Milestones.MILESTONE_3, ProposalCategory.Milestone3],
    [Milestones.MILESTONE_4, ProposalCategory.Milestone4],
    [Milestones.MILESTONE_5, ProposalCategory.Milestone5],
  ])('should map milestone %s to proposal category %s', (milestone, expectedCategory) => {
    expect(getProposalCategoryFromMilestone(milestone)).toBe(expectedCategory)
  })

  test.each([Milestones.NO_MILESTONE, undefined])('should use Grants when milestone is %s', milestone => {
    expect(getProposalCategoryFromMilestone(milestone)).toBe(ProposalCategory.Grants)
  })
})
