import { Header, Paragraph } from '@/components/Typography'

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

export const Description = ({ description }: DescriptionProps) => {
  const descriptionHtml = linkfyUrls(description)

  return (
    <div className="mt-14">
      <Header variant="h2" className="text-xl mb-4 text-white">
        DESCRIPTION
      </Header>
      <Paragraph
        variant="body"
        className="text-base text-white/90 whitespace-pre-line"
        html
        // eslint-disable-next-line react/no-children-prop
        children={descriptionHtml}
      />
    </div>
  )
}
