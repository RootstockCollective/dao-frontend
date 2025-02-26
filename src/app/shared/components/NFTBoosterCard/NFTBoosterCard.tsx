import Image from 'next/image'
import { FC } from 'react'

type NFTBoosterCardProps = {
  nftThumbPath: string
  boostValue: number
  title: string
  content: string
}

export const NFTBoosterCard: FC<NFTBoosterCardProps> = ({ nftThumbPath, boostValue, title, content }) => {
  return (
    <div className="w-[238px] h-[52px] relative rounded-xl" data-testid="nftBoosterCard">
      <svg
        className="absolute left-[-19px] top-[-20px]"
        width="277"
        height="92"
        viewBox="0 0 277 92"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g filter="url(#filter0_f_773_18628)">
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M17.7212 18.0696H259.721V74.0696H17.7212V18.0696ZM21.7212 22.0696V70.0696H255.721V22.0696H21.7212Z"
            fill="url(#paint0_linear_773_18628)"
          />
        </g>
        <defs>
          <filter
            id="filter0_f_773_18628"
            x="0.621191"
            y="0.96958"
            width="276.2"
            height="90.2"
            filterUnits="userSpaceOnUse"
            color-interpolation-filters="sRGB"
          >
            <feFlood flood-opacity="0" result="BackgroundImageFix" />
            <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
            <feGaussianBlur stdDeviation="8.55" result="effect1_foregroundBlur_773_18628" />
          </filter>
          <linearGradient
            id="paint0_linear_773_18628"
            x1="13.7212"
            y1="53.0696"
            x2="260.721"
            y2="53.0696"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#E56B1A" />
            <stop offset="0.360212" stopColor="#0D0D0D" />
            <stop offset="0.721797" stopColor="#0D0D0D" />
            <stop offset="1" stopColor="#C0F7FF" />
          </linearGradient>
        </defs>
      </svg>
      <svg
        className="absolute left-[-2px] top-[-2px]"
        width="242"
        height="56"
        viewBox="0 0 242 56"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="paint0_linear" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#E56B1A" />
            <stop offset="0.3499" stopColor="#0D0D0D" />
            <stop offset="0.722" stopColor="#0D0D0D" />
            <stop offset="1" stopColor="#C0F7FF" />
          </linearGradient>
        </defs>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M1.35254 1.05493H241.353V55.0549H1.35254V1.05493Z"
          stroke="url(#paint0_linear)"
          fill="#0D0D0D"
        />
      </svg>
      <div className="w-[238px] h-[52px] left-0 top-0 absolute bg-background flex-col justify-start items-start gap-1 inline-flex">
        <div className="h-[52px] p-1 flex-col justify-start items-start gap-1 inline-flex">
          <div className="self-stretch p-1 justify-start items-center gap-1 inline-flex">
            <div data-svg-wrapper className="relative w-8 h-8 bg-white">
              {nftThumbPath !== '' && <Image src={nftThumbPath} alt={title} width={50} height={50} />}
            </div>
            <div className="w-[188px] flex-col justify-start items-start gap-0.5 inline-flex">
              <div className="self-stretch text-white text-sm font-bold font-rootstock-sans leading-[14px] tracking-wide">
                {boostValue}% Rewards boost
              </div>
              <div className="self-stretch text-white text-[10px] font-normal font-rootstock-sans leading-[10px] tracking-wide">
                {content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
