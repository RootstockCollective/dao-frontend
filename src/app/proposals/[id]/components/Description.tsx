import { useState } from 'react'
import { Header, Paragraph } from '@/components/Typography'
import { ChevronDownIcon, ChevronUpIcon } from '@/components/Icons'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

interface DescriptionProps {
  description?: string
}

const linkfyUrls = (description: string | undefined | null): string => {
  if (typeof description !== 'string') return ''
  const urlRegex =
    /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/g
  return description.replace(urlRegex, url => {
    const href = url.startsWith('http') || url.startsWith('https') ? url : `https://${url}`
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" style="text-decoration: underline;">${url}</a>`
  })
}

const CHAR_LIMIT = 200

export const Description = ({ description }: DescriptionProps) => {
  const isDesktop = useIsDesktop()
  const [isExpanded, setIsExpanded] = useState(false)
  const shouldTruncate = !isDesktop && description && description.length > CHAR_LIMIT
  const displayText =
    shouldTruncate && !isExpanded ? description.substring(0, CHAR_LIMIT) + '...' : description

  return (
    <div className="mt-14">
      <div className="flex items-center justify-between mb-4">
        <Header variant="h2" className="text-xl text-white">
          DESCRIPTION
        </Header>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-white hover:text-white/80 transition-colors"
            aria-label={isExpanded ? 'Collapse description' : 'Expand description'}
          >
            {isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
          </button>
        )}
      </div>
      <Paragraph
        variant="body"
        className="text-base text-white/90 whitespace-pre-line break-words"
        html
        // eslint-disable-next-line react/no-children-prop
        children={linkfyUrls(displayText)}
      />
    </div>
  )
}
