import type { Meta, StoryObj } from '@storybook/react'
import { CallToActionCard } from './CallToActionCard'
import { BackingBanner } from '@/app/backing/components/BackingBanner/BackingBanner'
import { Header, Paragraph } from '@/components/TypographyNew'
import { Typography } from '@/components/TypographyNew/Typography'
import { MetricsContainer } from '@/components/containers/MetricsContainer'

const meta: Meta<typeof CallToActionCard> = {
  title: 'CollectiveRewards/CallToActionCard',
  component: CallToActionCard,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CallToActionCard>

export const Default: Story = {
  args: {
    banner: (
      <div className="p-4">
        <div
          className="flex flex-col items-start self-stretch p-6 text-v3-text-0"
          style={{
            background: 'linear-gradient(270deg, #442351 0%, #C0F7FF 49.49%, #E3FFEB 139.64%)',
          }}
        >
          Banner Content
        </div>
      </div>
    ),
    title: (
      <div>
        <Header caps variant="h1" className="px-6 py-4">
          <Paragraph className="text-v3-text-0">Default title</Paragraph>
          <Paragraph className="text-v3-bg-accent-20">Default subtitle</Paragraph>
        </Header>
      </div>
    ),
    children: (
      <MetricsContainer className="px-6 pb-10 pt-0">
        <Typography className="text-v3-text-0">Default container content</Typography>
      </MetricsContainer>
    ),
  },
}

export const CustomStyles: Story = {
  args: {
    className: 'bg-v3-bg-accent-100 p-4',
    banner: <BackingBanner className="rounded-t-lg" />,
    title: (
      <Header variant="h2" className="px-4">
        Custom Styled Call To Action Title
      </Header>
    ),
    children: (
      <MetricsContainer className="mx-4 ">
        <Typography>Customized container content</Typography>
      </MetricsContainer>
    ),
  },
}
