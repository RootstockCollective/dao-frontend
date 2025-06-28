import Image from 'next/image'
import React from 'react'
import { Header, Paragraph } from '../TypographyNew'
import { Button } from '../ButtonNew'

interface HeroComponentProps {
  title: string
  subtitle: string
  items: string[]
  buttonText?: string
  buttonOnClick?: () => void
}

const HeroComponent: React.FC<HeroComponentProps> = ({
  title,
  subtitle,
  items,
  buttonText,
  buttonOnClick,
}) => {
  return (
    <div className="flex flex-col bg-text-80 rounded-sm p-4 md:flex-row items-stretch gap-8">
      <div className="relative">
        <Image
          src="/images/hero/banner-squares.svg"
          alt="Squares Divider"
          width={40}
          height={30}
          className="absolute -right-[30px] top-[20px] z-10 hidden md:block"
        />
        <Image
          src="/images/hero/hero-banner.svg"
          alt="Hero Banner"
          width={0}
          height={0}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex flex-col justify-center">
        <div className="mt-16">
          <Header variant="e2" className="text-bg-100" caps>
            {title}
          </Header>
          <Header variant="e2" className="text-bg-20" caps>
            {subtitle}
          </Header>
        </div>
        <ul className="list-none my-4">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 text-sm md:text-base text-bg-100">
              <span className="inline-block mt-2 w-[6px] h-[6px] rounded-[32px] border border-bg-80 bg-transparent flex-shrink-0" />
              <Paragraph className="text-bg-100">{item}</Paragraph>
            </li>
          ))}
        </ul>

        {buttonText && (
          <div className="flex justify-start mt-2">
            <Button variant="primary" onClick={buttonOnClick}>
              {buttonText}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default HeroComponent
