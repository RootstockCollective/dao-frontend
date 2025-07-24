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
    src: '/images/intro/rbtc-bg-desktop.jpg',
  },
  argTypes: {
    src: {
      control: 'text',
      description: 'Image URL to display',
    },
    fallbackSrc: {
      control: 'text',
      description: 'Fallback image URL to display if main image fails to load',
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
    src: '/images/intro/rif-bg-desktop.jpg',
  },
}

export const LargeHoles: Story = {
  args: {
    squareSize: 15,
    src: '/images/intro/strif-bg-desktop.jpg',
  },
}

export const WideImage: Story = {
  args: {
    width: 450,
    height: 200,
    squareSize: 8,
    src: '/images/intro/rbtc-rif-bg-desktop.jpg',
  },
}

export const SquareImage: Story = {
  args: {
    width: 250,
    height: 250,
    squareSize: 6,
    src: '/images/intro/strif-bg-desktop.jpg',
  },
}

export const TallImage: Story = {
  args: {
    width: 200,
    height: 350,
    squareSize: 4,
    src: '/images/intro/rbtc-bg-mobile.jpg',
  },
}

export const SlowLoading: Story = {
  args: {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80', // External image to simulate slow loading
    fallbackSrc: '/images/nfts/empty-nft-cover.png',
    width: 300,
    height: 300,
    squareSize: 8,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows placeholder behavior while image loads with fallback support',
      },
    },
  },
}

export const WithFallback: Story = {
  args: {
    src: '/images/intro/rbtc-bg-desktop.jpg',
    fallbackSrc: '/images/nfts/empty-nft-cover.png',
    width: 300,
    height: 300,
    squareSize: 6,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows working image with fallback configured',
      },
    },
  },
}

export const BrokenImageWithFallback: Story = {
  args: {
    src: 'https://broken-url-that-does-not-exist.jpg',
    fallbackSrc: '/images/nfts/empty-nft-cover.png',
    width: 300,
    height: 300,
    squareSize: 8,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows fallback image when main image fails to load',
      },
    },
  },
}

export const BrokenImageWithoutFallback: Story = {
  args: {
    src: 'https://another-broken-url.jpg',
    width: 300,
    height: 300,
    squareSize: 8,
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows nothing when both main image fails and no fallback provided',
      },
    },
  },
}

export const Gallery: Story = {
  render: () => (
    <div className="flex flex-wrap gap-6 p-4 justify-center">
      <div className="text-center">
        <h3 className="text-sm font-semibold mb-2">Normal image</h3>
        <ImageMask src="/images/intro/rbtc-bg-desktop.jpg" width={200} height={200} squareSize={2} />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold mb-2">With fallback</h3>
        <ImageMask
          src="/images/intro/rif-bg-desktop.jpg"
          fallbackSrc="/images/nfts/empty-nft-cover.png"
          width={200}
          height={200}
          squareSize={8}
        />
      </div>
      <div className="text-center">
        <h3 className="text-sm font-semibold mb-2">Broken + fallback</h3>
        <ImageMask
          src="https://broken-image-url.jpg"
          fallbackSrc="/images/nfts/empty-nft-cover.png"
          width={200}
          height={200}
          squareSize={12}
        />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Examples with different scenarios including fallback images',
      },
    },
  },
}
