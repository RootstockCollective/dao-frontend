import { z } from 'zod'
import { currentLinks } from '@/lib/links'

const discourseLink = new URL(currentLinks.forum)

export const BaseProposalSchema = z.object({
  proposalName: z
    .string()
    .trim()
    .min(5, { message: 'Proposal name must be at least 5 characters' })
    .max(100, { message: 'Proposal name must be at most 100 characters' }),
  discourseLink: z
    .string()
    .trim()
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
    .min(10, { message: 'Description must be at least 10 characters' })
    .max(3000, { message: 'Description must be at most 3000 characters' }),
})

export type BaseProposalFormData = z.infer<typeof BaseProposalSchema>
