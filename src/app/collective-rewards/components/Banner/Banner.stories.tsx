import type { Meta, StoryObj } from '@storybook/react'
import { Banner } from './Banner'
import { BuildersDecorativeSquares } from '../DecorativeSquares'
import { BackersDecorativeSquares } from '../DecorativeSquares'

const meta: Meta<typeof Banner> = {
  title: 'CollectiveRewards/Banner',
  component: Banner,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    imageSrc: {
      control: 'text',
      description: 'Source URL for the banner image',
    },
    altText: {
      control: 'text',
      description: 'Alt text for accessibility',
    },
    DecorativeComponent: {
      control: false,
      description: 'Decorative component to display over the banner',
    },
  },
  decorators: [
    Story => (
      <div className="bg-v3-text-80 p-5">
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const BuildersBanner: Story = {
  args: {
    imageSrc: '/images/cta-banner-builders.png',
    altText: 'Builders Call to Action Banner',
    DecorativeComponent: BuildersDecorativeSquares,
  },
}

export const BackersBanner: Story = {
  args: {
    imageSrc: '/images/cta-banner-backers.png',
    altText: 'Backers Call to Action Banner',
    DecorativeComponent: BackersDecorativeSquares,
  },
}
