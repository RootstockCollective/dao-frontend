import { Paragraph } from '@/components/TypographyNew'
import { Typography } from '@/components/TypographyNew/Typography'
import { Button } from '@/components/Button/Button'
import Image from 'next/image'
import CollapsibleWithPreview from '@/components/CollapsibleWithPreview/CollapsibleWithPreview'
import { FC } from 'react'

const BecomeBuilderCollapsible: FC = () => {
  const handleBecomeBuilder = () => {
    // FIXME: Implement become builder functionality
  }

  const handleApplyGrant = () => {
    // FIXME: Implement apply for grant functionality
  }

  const expandedContent = (
    <div className="flex flex-col md:flex-row gap-0 items-start h-full">
      {/* Left: Image */}
      <div className="relative overflow-hidden h-full min-h-[304px] basis-1/4 md:basis-1/4 flex-shrink-0 w-full transition-all duration-300 ease-in-out">
        <Image
          src="/images/become-a-builder-banner-big.png"
          alt="Become a Builder Banner"
          fill
          className="object-fill"
          priority
        />
      </div>
      {/* Center: Main Content */}
      <div className="flex flex-col text-base justify-center gap-4 basis-1/2 md:basis-1/2 mt-16">
        <div>
          <Typography variant="h1" className="text-v3-text-0">
            BECOME A COLLECTIVE BUILDER,
          </Typography>
          <br />
          <Typography variant="h1" className="text-v3-text-60 mt-2">
            GET RICH AND FAMOUS
          </Typography>
        </div>
        <Paragraph className="text-v3-text-0">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas dictum dignissim libero, eu
          imperdiet neque dignissim non.
        </Paragraph>
        <div className="flex gap-4 mt-2">
          <Button variant="primary" onClick={handleBecomeBuilder}>
            Become a Builder
          </Button>
          <Button variant="secondary" onClick={handleApplyGrant}>
            Apply for a Grant
          </Button>
        </div>
      </div>
      {/* Right: Why Become a Builder */}
      <div className="flex flex-col justify-center bg-transparent basis-1/4 md:basis-1/4 w-full md:pl-8 mt-16">
        <Typography variant="h3" className="text-v3-text-0 mb-4">
          WHY BECOME A BUILDER?
        </Typography>
        <ul className="list-[circle] pl-4 text-v3-text-0">
          <li>
            <Paragraph>Lorem ipsum dolor sit amet</Paragraph>
          </li>
          <li>
            <Paragraph>Consectetur adipiscing</Paragraph>
          </li>
          <li>
            <Paragraph>Elit maecenas dictum eu</Paragraph>
          </li>
          <li>
            <Paragraph>Imperdiet neque dignissim</Paragraph>
          </li>
        </ul>
      </div>
    </div>
  )

  const collapsedContent = (
    <div className="flex items-center basis-3/4 justify-start">
      <div className="relative overflow-hidden h-full basis-1/4 md:basis-1/4 flex-shrink-0 w-full">
        <div className="relative w-full h-[56px]">
          <Image
            src="/images/become-a-builder-banner-small.png"
            alt="Become a Builder Banner"
            fill
            className="object-fill"
            priority
          />
        </div>
      </div>
      <Paragraph className="text-v3-text-100 ml-1">
        Learn how you can become a Collective Builder and how to apply for a Grant
      </Paragraph>
    </div>
  )

  return (
    <CollapsibleWithPreview
      expandedContent={expandedContent}
      collapsedContent={collapsedContent}
      expandedState={{
        backgroundColor: 'bg-v3-text-80',
        chevronColor: 'text-v3-bg-accent-100',
      }}
      collapsedState={{
        backgroundColor: 'bg-v3-bg-accent-80',
        chevronColor: 'text-v3-text-100',
      }}
      defaultOpen={true}
    />
  )
}

export default BecomeBuilderCollapsible
