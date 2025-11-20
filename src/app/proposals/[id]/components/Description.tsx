import { Header } from '@/components/Typography'
import { Expandable, ExpandableHeader } from '@/components/Expandable'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { parseProposalDescription } from '@/app/proposals/shared/utils'
import { MD } from '@/components/MD'
import { useExpandableContext } from '@/components/Expandable/ExpandableContext'

interface DescriptionProps {
  description?: string
}

const DescriptionHeader = () => (
  <Header variant="h2" className="text-xl text-white">
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

interface DescriptionProps {
  descriptionText: string
}

const DesktopDescriptionContent = ({ descriptionText }: DescriptionProps) => {
  return <MD>{descriptionText}</MD>
}

const MobileDescriptionContent = ({ descriptionText }: DescriptionProps) => {
  const { isExpanded } = useExpandableContext()
  const previewText = getFirstLines(descriptionText, 3)

  return (
    <>
      {!isExpanded && (
        <div className="my-2 relative">
          <MD className="line-clamp-3">{previewText}</MD>
        </div>
      )}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[2500px] opacity-100 my-2' : 'max-h-0 opacity-0'
        }`}
      >
        <MD>{descriptionText}</MD>
      </div>
    </>
  )
}

export const Description = ({ description }: DescriptionProps) => {
  const isDesktop = useIsDesktop()
  // Parse the raw description to extract just the display text (without name/metadata)
  const descriptionText = description ? parseProposalDescription(description).description : ''

  return (
    <div className="md:px-6 px-4 py-10 sm:pb-8">
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
