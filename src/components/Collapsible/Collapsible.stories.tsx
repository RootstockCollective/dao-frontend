import type { Meta, StoryObj } from '@storybook/nextjs'
import { Collapsible } from './Collapsible'
import { BackingBanner } from '@/app/backing/components/BackingBanner/BackingBanner'
import { Header, Paragraph } from '@/components/Typography'
import { BaseTypography } from '@/components/Typography/Typography'
import { MetricsContainer } from '@/components/containers/MetricsContainer'

const meta: Meta<typeof Collapsible.Root> = {
  title: 'Components/Collapsible',
  component: Collapsible.Root,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Collapsible>

export const Default: Story = {
  render: () => (
    <Collapsible.Root>
      <div className="hidden md:block">
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
      </div>

      <div>
        <Header caps variant="h1" className="px-6 py-4">
          <Paragraph className="text-v3-text-0">Default title</Paragraph>
          <Paragraph className="text-v3-bg-accent-20">Default subtitle</Paragraph>
        </Header>
      </div>

      <div>
        <MetricsContainer className="px-6 pb-10 pt-0">
          <BaseTypography className="text-v3-text-0">Default container content</BaseTypography>
        </MetricsContainer>
      </div>
    </Collapsible.Root>
  ),
}

export const CustomStyles: Story = {
  render: () => (
    <Collapsible.Root className="bg-v3-bg-accent-100 p-4">
      <div className="hidden md:block">
        <BackingBanner className="rounded-t-lg" />
      </div>

      <div>
        <Header variant="h2" className="px-4">
          Custom Styled Call To Action Title
        </Header>
      </div>

      <div>
        <MetricsContainer className="mx-4">
          <BaseTypography>Customized container content</BaseTypography>
        </MetricsContainer>
      </div>
    </Collapsible.Root>
  ),
}
