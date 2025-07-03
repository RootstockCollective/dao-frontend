import type { Meta, StoryObj } from '@storybook/react'
import { Banner } from '@/components/Banner/Banner'
import { Header, Span } from '@/components/TypographyNew'

const meta = {
  title: 'KOTO/DAO/Banner',
  component: Banner,
  argTypes: {
    imageSrc: {
      control: 'text',
      description: 'Source URL for the main banner image',
    },
    imageSquaresSrc: {
      control: 'text',
      description: 'Source URL for the decorative squares image',
    },
    rightContent: {
      control: false,
      description: 'React component/element to display on the right side of the banner',
    },
  },
} satisfies Meta<typeof Banner>

export default meta
type Story = StoryObj<typeof meta>

// Mock content components for stories
const DefaultContent = () => (
  <div className="mt-[64px]">
    <Header variant="e1" className="text-bg-100 text-[32px] leading-[40px]">
      WELCOME TO OUR PLATFORM
    </Header>
    <Header variant="e1" className="text-bg-20 text-[32px] leading-[40px]">
      BUILD THE FUTURE TOGETHER
    </Header>
    <ul className="text-bg-100 mt-[16px] list-disc list-inside">
      <li>
        <Span>innovative technology solutions</Span>
      </li>
      <li>
        <Span>community-driven development</Span>
      </li>
      <li>
        <Span>secure and transparent processes</Span>
      </li>
      <li>
        <Span>continuous improvement and growth</Span>
      </li>
    </ul>
  </div>
)

const DelegateContent = () => (
  <div className="mt-[64px]">
    <Header variant="e1" className="text-bg-100 text-[32px] leading-[40px]">
      DELEGATE YOUR VOTING POWER
    </Header>
    <Header variant="e1" className="text-bg-20 text-[32px] leading-[40px]">
      TO INFLUENCE WHAT GETS BUILT
    </Header>
    <ul className="text-bg-100 mt-[16px] list-disc list-inside">
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

const GovernanceContent = () => (
  <div className="mt-[64px]">
    <Header variant="e1" className="text-bg-100 text-[32px] leading-[40px]">
      PARTICIPATE IN GOVERNANCE
    </Header>
    <Header variant="e1" className="text-bg-20 text-[32px] leading-[40px]">
      SHAPE THE PROTOCOL&#39;S FUTURE
    </Header>
    <ul className="text-bg-100 mt-[16px] list-disc list-inside">
      <li>
        <Span>vote on protocol upgrades and proposals</Span>
      </li>
      <li>
        <Span>contribute to strategic decision making</Span>
      </li>
      <li>
        <Span>earn rewards for active participation</Span>
      </li>
      <li>
        <Span>help maintain decentralized governance</Span>
      </li>
    </ul>
  </div>
)

const StakingContent = () => (
  <div className="mt-[64px]">
    <Header variant="e1" className="text-bg-100 text-[32px] leading-[40px]">
      STAKE YOUR TOKENS
    </Header>
    <Header variant="e1" className="text-bg-20 text-[32px] leading-[40px]">
      EARN PASSIVE REWARDS
    </Header>
    <ul className="text-bg-100 mt-[16px] list-disc list-inside">
      <li>
        <Span>secure the network while earning yields</Span>
      </li>
      <li>
        <Span>flexible staking periods available</Span>
      </li>
      <li>
        <Span>competitive annual percentage yields</Span>
      </li>
      <li>
        <Span>compound your rewards automatically</Span>
      </li>
    </ul>
  </div>
)

const ShortContent = () => (
  <div className="mt-[64px]">
    <Header variant="e1" className="text-bg-100 text-[32px] leading-[40px]">
      GET STARTED
    </Header>
    <Header variant="e1" className="text-bg-20 text-[32px] leading-[40px]">
      TODAY
    </Header>
  </div>
)

const LongContent = () => (
  <div className="mt-[64px]">
    <Header variant="e1" className="text-bg-100 text-[32px] leading-[40px]">
      COMPREHENSIVE DECENTRALIZED
    </Header>
    <Header variant="e1" className="text-bg-20 text-[32px] leading-[40px]">
      AUTONOMOUS ORGANIZATION PLATFORM
    </Header>
    <ul className="text-bg-100 mt-[16px] list-disc list-inside">
      <li>
        <Span>
          participate in comprehensive governance mechanisms that allow you to influence every aspect of the
          protocol
        </Span>
      </li>
      <li>
        <Span>maintain full custody of your digital assets while participating in delegation processes</Span>
      </li>
      <li>
        <Span>
          optimize your transaction costs through efficient delegation strategies and gas optimization
          techniques
        </Span>
      </li>
      <li>
        <Span>
          accumulate rewards automatically through our innovative staking and delegation reward distribution
          system
        </Span>
      </li>
      <li>
        <Span>
          access advanced analytics and reporting tools to track your participation and reward metrics
        </Span>
      </li>
    </ul>
  </div>
)

const InteractiveContent = () => (
  <div className="mt-[64px]">
    <Header variant="e1" className="text-bg-100 text-[32px] leading-[40px]">
      TAKE ACTION NOW
    </Header>
    <Header variant="e1" className="text-bg-20 text-[32px] leading-[40px]">
      START DELEGATING TODAY
    </Header>
    <ul className="text-bg-100 mt-[16px] list-disc list-inside mb-[24px]">
      <li>
        <Span>connect your wallet securely</Span>
      </li>
      <li>
        <Span>choose your delegation strategy</Span>
      </li>
      <li>
        <Span>monitor your rewards in real-time</Span>
      </li>
    </ul>
    <div className="flex flex-col gap-3">
      <button
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
        onClick={() => console.log('Connect Wallet clicked')}
      >
        Connect Wallet
      </button>
      <button
        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
        onClick={() => console.log('Learn More clicked')}
      >
        Learn More
      </button>
    </div>
  </div>
)

export const Default: Story = {
  args: {
    imageSrc: '/images/banner/delegate-banner.png',
    imageSquaresSrc: '/images/hero/banner-squares.svg',
    rightContent: <DefaultContent />,
  },
}

export const Delegate: Story = {
  args: {
    imageSrc: '/images/banner/delegate-banner.png',
    imageSquaresSrc: '/images/hero/banner-squares.svg',
    rightContent: <DelegateContent />,
  },
}

export const Governance: Story = {
  args: {
    imageSrc: '/images/banner/governance-banner.png',
    imageSquaresSrc: '/images/hero/banner-squares.svg',
    rightContent: <GovernanceContent />,
  },
}

export const Staking: Story = {
  args: {
    imageSrc: '/images/banner/staking-banner.png',
    imageSquaresSrc: '/images/hero/banner-squares.svg',
    rightContent: <StakingContent />,
  },
}

export const WithShortContent: Story = {
  args: {
    imageSrc: '/images/banner/delegate-banner.png',
    imageSquaresSrc: '/images/hero/banner-squares.svg',
    rightContent: <ShortContent />,
  },
}

export const WithLongContent: Story = {
  args: {
    imageSrc: '/images/banner/delegate-banner.png',
    imageSquaresSrc: '/images/hero/banner-squares.svg',
    rightContent: <LongContent />,
  },
}

export const WithInteractiveContent: Story = {
  args: {
    imageSrc: '/images/banner/delegate-banner.png',
    imageSquaresSrc: '/images/hero/banner-squares.svg',
    rightContent: <InteractiveContent />,
  },
}
