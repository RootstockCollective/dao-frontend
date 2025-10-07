import { Header, Paragraph } from '@/components/Typography'
import { Expandable, ExpandableHeader, ExpandableContent } from '@/components/Expandable'
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

const DescriptionHeader = () => (
  <Header variant="h2" className="text-xl text-white">
    DESCRIPTION
  </Header>
)
const DescriptionContent = ({ descriptionHtml }: { descriptionHtml: string }) => {
  const isDesktop = useIsDesktop()
  return isDesktop ? (
    <Paragraph variant="body" className="text-base text-white" html>
      {descriptionHtml}
    </Paragraph>
  ) : (
    <ExpandableContent showPreview={!isDesktop && !!descriptionHtml}>{descriptionHtml}</ExpandableContent>
  )
}

export const Description = ({ description }: DescriptionProps) => {
  const isDesktop = useIsDesktop()
  const descriptionHtml = linkfyUrls(description)

  return (
    <div className="mt-14">
      {!isDesktop ? (
        <Expandable expanded={isDesktop}>
          <ExpandableHeader triggerColor="white">
            <DescriptionHeader />
          </ExpandableHeader>
          <DescriptionContent descriptionHtml={descriptionHtml} />
        </Expandable>
      ) : (
        <>
          <DescriptionHeader />
          <DescriptionContent descriptionHtml={descriptionHtml} />
        </>
      )}
    </div>
  )
}
