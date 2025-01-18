'use client'

import { HTMLAttributes, PropsWithChildren } from 'react'
import { cn } from '@/lib/utils'
import type { Card as CardType } from './cards'
import Image, { StaticImageData } from 'next/image'
import { Button } from '@/components/Button'
import { HeaderTitle, Typography } from '@/components/Typography'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  card: CardType
  handleFindMore: (id: number) => void
  handleChoose: (id: number) => void
}

export function Card({ card, className, handleChoose, handleFindMore, ...props }: CardProps) {
  return (
    <div
      className={cn(className, 'w-[348px] h-[582px] min-w-[200px] p-2 bg-[#1A1A1A] overflow-hidden')}
      {...props}
    >
      <CardBackground image={card.image} alt={card.title}>
        <div className="h-full py-7 flex flex-col items-center leading-tight">
          <HeaderTitle className="text-[32px] text-center">{card.title}</HeaderTitle>
          <div className="mb-[18px] flex-grow flex items-end">
            <div className="min-h-[5.5rem]">
              <Typography className="leading-[22.4px]" tagVariant="p">
                {card.description}
              </Typography>
            </div>
          </div>
          <Button onClick={() => handleChoose(card.id)} className="mb-[14px] px-3 py-2">
            Choose proposal
          </Button>
          <Typography
            onClick={() => handleFindMore(card.id)}
            className="text-lg font-bold leading-none cursor-pointer"
            tagVariant="p"
          >
            Find out more
          </Typography>
        </div>
      </CardBackground>
    </div>
  )
}

interface CardBackgroundProps extends PropsWithChildren {
  image: StaticImageData
  alt: string
}
function CardBackground({ image, alt, children }: CardBackgroundProps) {
  return (
    <div className="relative w-full h-full">
      <div className="absolute w-full h-full z-[2]">{children}</div>
      <div
        className="absolute w-full h-[506px] z-[1]"
        style={{
          background:
            'linear-gradient(180deg, rgba(26, 26, 26, 0.84) 7.85%, rgba(26, 26, 26, 0) 41.38%, #1A1A1A 74.71%)',
        }}
      />
      <div className="absolute h-[506px] w-full z-0">
        <Image priority fill src={image} alt={alt} placeholder="blur" className="object-cover" sizes="30vw" />
      </div>
    </div>
  )
}
