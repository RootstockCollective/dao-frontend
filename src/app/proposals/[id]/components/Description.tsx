import { parseProposalDescription } from '@/app/proposals/shared/utils'
import { Expandable, ExpandableHeader } from '@/components/Expandable'
import { useExpandableContext } from '@/components/Expandable/ExpandableContext'
import { MD as Markdown } from '@/components/MD'
import { Header } from '@/components/Typography'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'

interface DescriptionProps {
  description?: string
  shouldParse?: boolean // If false, display description as-is without parsing (useful for review/preview)
}

const DescriptionHeader = () => (
  <Header variant="h2" className="text-xl text-text-100">
    DESCRIPTION
  </Header>
)

/**
 * Extracts the first N lines from markdown text
 * Preserves markdown formatting for preview
 */
const getFirstLines = (text: string, lineCount: number = 3): string => {
  const lines = text.split('\n')
  return lines.slice(0, lineCount).join('\n')
}

interface DescriptionContentProps {
  descriptionText: string
}

const DesktopDescriptionContent = ({ descriptionText }: DescriptionContentProps) => {
  return <Markdown className="mt-10 [&>*:first-child]:mt-0">{descriptionText}</Markdown>
}

const MobileDescriptionContent = ({ descriptionText }: DescriptionContentProps) => {
  const { isExpanded } = useExpandableContext()
  const previewText = getFirstLines(descriptionText, 3)

  return (
    <>
      {!isExpanded && (
        <div className="mt-2 relative">
          <Markdown className="line-clamp-3 [&>*:first-child]:mt-0">{previewText}</Markdown>
        </div>
      )}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[2500px] opacity-100 mt-2' : 'max-h-0 opacity-0'
        }`}
      >
        <Markdown className="[&>*:first-child]:mt-0">{descriptionText}</Markdown>
      </div>
    </>
  )
}

export const Description = ({ description, shouldParse = true }: DescriptionProps) => {
  const isDesktop = useIsDesktop()
  // Parse the raw description to extract just the display text (without name/metadata)
  // Only parse if shouldParse is true (for published proposals), otherwise use raw description (for review/preview)
  const descriptionText = description
    ? shouldParse
      ? parseProposalDescription(description).description
      : description
    : ''

  return (
    <div className="md:px-6 px-4 pt-14 pb-10">
      {!isDesktop ? (
        <Expandable expanded={false}>
          <ExpandableHeader triggerColor="white">
            <DescriptionHeader />
          </ExpandableHeader>
          <MobileDescriptionContent descriptionText={descriptionText} />
        </Expandable>
      ) : (
        <>
          <DescriptionHeader />
          <DesktopDescriptionContent descriptionText={descriptionText} />
        </>
      )}
    </div>
  )
}
