import { Metadata } from 'next'
import { PropsWithChildren } from 'react'
import { getProposalById } from '../actions/getProposalById'
import { headers } from 'next/headers'

interface Props {
  params: Promise<{ id: string }>
}

/**
 * Generate metadata for proposal detail pages
 * This enables Open Graph and Twitter Card previews when sharing proposal URLs
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const proposal = await getProposalById(id)

  // Get the base URL for absolute image URLs
  // Prefer environment variable if set, otherwise derive from request headers
  let baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  if (!baseUrl) {
    const headersList = await headers()
    const protocol = headersList.get('x-forwarded-proto') || 'https'
    const host = headersList.get('host') || 'localhost:3000'
    baseUrl = `${protocol}://${host}`
  }

  // Use PNG for better compatibility with Open Graph and Twitter Cards
  const ogImage = `${baseUrl}/images/wordmark.png`

  // Default metadata if proposal not found
  if (!proposal) {
    return {
      title: 'Proposal Not Found | RootstockCollective',
      description: 'The requested proposal could not be found.',
      openGraph: {
        title: 'Proposal Not Found | RootstockCollective',
        description: 'The requested proposal could not be found.',
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: 'RootstockCollective Proposals',
          },
        ],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Proposal Not Found | RootstockCollective',
        description: 'The requested proposal could not be found.',
        images: [ogImage],
      },
    }
  }

  // Extract proposal name and description
  const proposalName = proposal.name || 'Proposal'

  // Clean up description for metadata
  // Remove DiscourseLink references and extract meaningful text
  let description = proposal.description || ''

  // Remove DiscourseLink: prefix and URL if present
  const discourseLinkPattern = /DiscourseLink:\s*https?:\/\/[^\s]+/gi
  description = description.replace(discourseLinkPattern, '').trim()

  // If description contains semicolon (DAO format), use the part after the semicolon
  if (description.includes(';')) {
    const parts = description.split(';')
    description = parts.slice(1).join(';').trim() || parts[0].trim()
  }

  // Extract first meaningful sentence or line
  const firstLine = description.split('\n')[0].trim()
  const firstSentence = firstLine.split('.')[0].trim()

  // Use first sentence if it's meaningful, otherwise use first line
  description = firstSentence.length > 20 ? firstSentence : firstLine

  // Fallback to default if description is empty or too short
  if (!description || description.length < 10) {
    description = `View this proposal on RootstockCollective DAO`
  }

  // Truncate description for metadata (Twitter has a 200 char limit for description)
  const truncatedDescription = description.length > 200 ? `${description.substring(0, 197)}...` : description

  // Construct the proposal URL
  const proposalUrl = `${baseUrl}/proposals/${id}`

  return {
    title: `${proposalName} | RootstockCollective`,
    description: truncatedDescription,
    openGraph: {
      title: proposalName,
      description: truncatedDescription,
      url: proposalUrl,
      siteName: 'RootstockCollective',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: proposalName,
        },
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: proposalName,
      description: truncatedDescription,
      images: [`${baseUrl}/images/wordmark.svg`],
    },
  }
}

export default function ProposalDetailLayout({ children }: PropsWithChildren) {
  return <>{children}</>
}
