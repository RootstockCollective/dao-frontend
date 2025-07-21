import { z } from 'zod'
import { currentLinks } from '@/lib/links'

const discourseLink = new URL(currentLinks.forum)

// Constants for field limits
export const BASE_PROPOSAL_LIMITS = {
  proposalName: { min: 5, max: 100 },
  description: { min: 10, max: 3000 },
  discourseLink: { max: 500 }, // Reasonable limit for URLs
  address: { max: 42 },
} as const

export const BaseProposalSchema = z.object({
  proposalName: z
    .string()
    .trim()
    .min(BASE_PROPOSAL_LIMITS.proposalName.min, { message: 'Proposal name must be at least 5 characters' })
    .max(BASE_PROPOSAL_LIMITS.proposalName.max, { message: 'Proposal name must be at most 100 characters' }),
  discourseLink: z
    .string()
    .trim()
    .max(BASE_PROPOSAL_LIMITS.discourseLink.max, {
      message: 'Discourse link is too long (max 500 characters)',
    })
    .url({ message: 'Discourse link must be a valid URL' })
    .refine(
      url => {
        // Check if URL starts with our specific Discourse domain
        if (!url.startsWith(discourseLink.toString())) return false

        // Check if the URL contains typical Discourse patterns
        // Pattern: /t/topic-name/topic-id or /t/topic-name/topic-id/post-number
        const discoursePattern = /\/t\/[^\/]+\/\d+(\/\d+)?$/

        return discoursePattern.test(url)
      },
      {
        message: `Discourse link must be a valid HTTPS URL from ${discourseLink.hostname} with format: ${discourseLink}t/topic-name/topic-id`,
      },
    ),
  description: z
    .string()
    .trim()
    .min(BASE_PROPOSAL_LIMITS.description.min, { message: 'Description must be at least 10 characters' })
    .max(BASE_PROPOSAL_LIMITS.description.max, { message: 'Description must be at most 3000 characters' }),
})

export type BaseProposalFormData = z.infer<typeof BaseProposalSchema>
