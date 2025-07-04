import { Header, Span } from '@/components/TypographyNew'
import React from 'react'
import { Banner } from '@/components/Banner/Banner'

export const BannerDelegate = () => (
  <Banner
    imageSrc="/images/banner/delegate-banner.png"
    imageSquaresSrc="/images/hero/banner-squares.svg"
    rightContent={<BannerDelegateContent />}
  />
)

const BannerDelegateContent = () => (
  <div className="mt-[64px]">
    <Header variant="e1" className="text-bg-100 text-[32px] leading-[40px]">
      DELEGATE YOUR VOTING POWER
    </Header>
    <Header variant="e1" className="text-bg-20 text-[32px] leading-[40px]">
      TO INFLUENCE WHAT GETS BUILT
    </Header>
    <ul className="text-bg-100 mt-[16px] list-[circle] list-inside">
      <li>
        <Span>you are only delegating your own voting power</Span>
      </li>
      <li>
        <Span>your coins stay in your wallet</Span>
      </li>
      <li>
        <Span>you save on gas cost while being represented</Span>
      </li>
      <li>
        <Span>your Rewards will keep accumulating as usual</Span>
      </li>
    </ul>
  </div>
)
