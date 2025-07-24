import type { Meta, StoryObj } from '@storybook/react'
import { ImageMask } from './ImageMask'

const meta: Meta<typeof ImageMask> = {
  title: 'Components/ImageMask',
  component: ImageMask,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'ImageMask creates a cropped image with pixel-art style holes. Shows 3 holes on the right with image continuation and 1 transparent hole on the left.',
      },
    },
  },
  args: {
    width: 300,
    height: 300,
    squareSize: 5,
    imgUrl: '/images/intro/rbtc-bg-desktop.jpg',
  },
  argTypes: {
    imgUrl: {
      control: 'text',
      description: 'Image URL to display',
    },
    width: {
      control: { type: 'range', min: 100, max: 600, step: 25 },
      description: 'Width of the main image area',
    },
    height: {
      control: { type: 'range', min: 100, max: 600, step: 25 },
      description: 'Height of the main image area',
    },
    squareSize: {
      control: { type: 'range', min: 1, max: 25, step: 1 },
      description: 'Size of the holes in pixels',
    },
  },
}

export default meta
type Story = StoryObj<typeof ImageMask>

export const Basic: Story = {}

export const SmallHoles: Story = {
  args: {
    squareSize: 2,
    imgUrl: '/images/intro/rif-bg-desktop.jpg',
  },
}

export const LargeHoles: Story = {
  args: {
    squareSize: 15,
    imgUrl: '/images/intro/strif-bg-desktop.jpg',
  },
}

export const WideImage: Story = {
  args: {
    width: 450,
    height: 200,
    squareSize: 8,
    imgUrl: '/images/intro/rbtc-rif-bg-desktop.jpg',
  },
}

export const SquareImage: Story = {
  args: {
    width: 250,
    height: 250,
    squareSize: 6,
    imgUrl: '/images/intro/strif-bg-desktop.jpg',
  },
}

export const TallImage: Story = {
  args: {
    width: 200,
    height: 350,
    squareSize: 4,
    imgUrl: '/images/intro/rbtc-bg-mobile.jpg',
  },
}

export const Gallery: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6 p-4 justify-center">
      <div className="text-center">
        <h3 className="text-sm font-semibold mb-2">Tiny holes</h3>
        <ImageMask imgUrl="/images/intro/rbtc-bg-desktop.jpg" width={200} height={200} squareSize={2} />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold mb-2">Medium holes</h3>
        <ImageMask imgUrl="/images/intro/rif-bg-desktop.jpg" width={200} height={200} squareSize={8} />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold mb-2">Large holes</h3>
        <ImageMask imgUrl="/images/intro/strif-bg-desktop.jpg" width={200} height={200} squareSize={18} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples with different hole sizes',
      },
    },
  },
}
