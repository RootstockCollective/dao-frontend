import { Header } from '@/components/Typography'
import { Expandable, ExpandableHeader, ExpandableContent } from '@/components/Expandable'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { parseProposalDescription } from '@/app/proposals/shared/utils'
import { MD } from '@/components/MD'

interface DescriptionProps {
  description?: string
}

export const Description = ({ description }: DescriptionProps) => {
  const isDesktop = useIsDesktop()
  // Parse the raw description to extract just the display text (without name/metadata)
  const descriptionText = description ? parseProposalDescription(description).description : ''

  if (isDesktop) {
    return (
      <div className="md:px-6 px-4 py-10 sm:pb-8">
        <Header variant="h2" className="text-xl text-white">
          DESCRIPTION
        </Header>
        <MD>{descriptionText}</MD>
      </div>
    )
  }

  return (
    <div className="md:px-6 px-4 py-10 sm:pb-8">
      <Expandable expanded={false}>
        <ExpandableHeader triggerColor="white">
          <Header variant="h2" className="text-xl text-white">
            DESCRIPTION
          </Header>
        </ExpandableHeader>
        <ExpandableContent showPreview={!!descriptionText}>
          <MD>{descriptionText}</MD>
        </ExpandableContent>
      </Expandable>
    </div>
  )
}
