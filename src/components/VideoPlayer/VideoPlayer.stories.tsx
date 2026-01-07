import { Meta, StoryObj } from '@storybook/nextjs'
import { VideoPlayer } from './VideoPlayer'

const meta: Meta<typeof VideoPlayer> = {
  title: 'Components/VideoPlayer',
  component: VideoPlayer,
  argTypes: {
    url: {
      control: 'text',
      description: 'Video URL from supported platforms (YouTube, Vimeo, Loom, Twitch, Rumble)',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
  },
}

export default meta

type Story = StoryObj<typeof VideoPlayer>

// YouTube examples
export const YouTubeStandard: Story = {
  args: {
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    className: 'p-4',
  },
}

export const YouTubeShort: Story = {
  args: {
    url: 'https://youtu.be/dQw4w9WgXcQ',
    className: 'p-4',
  },
}

export const YouTubeEmbed: Story = {
  args: {
    url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    className: 'p-4',
  },
}

// Vimeo example
export const Vimeo: Story = {
  args: {
    url: 'https://vimeo.com/980152198',
    className: 'p-4',
  },
}

// Loom example
export const Loom: Story = {
  args: {
    url: 'https://www.loom.com/share/a1af14b714b44c249dcc1f57fa35ea35',
    className: 'p-4',
  },
}

// Twitch example
export const Twitch: Story = {
  args: {
    url: 'https://www.twitch.tv/videos/2327905992',
    className: 'p-4',
  },
}

// Rumble example
// export const Rumble: Story = {
//   args: {
//     url: 'https://rumble.com/v6upn69-urologist-reacts-to-dr.-glaucomfleckens-first-day-of-urology.html',
//     className: 'p-4',
//   },
// }

// Edge cases
export const InvalidUrl: Story = {
  args: {
    url: 'https://example.com/not-a-video',
    className: 'p-4',
  },
}

export const NullUrl: Story = {
  args: {
    url: null,
    className: 'p-4',
  },
}

export const UndefinedUrl: Story = {
  args: {
    url: undefined,
    className: 'p-4',
  },
}

export const EmptyUrl: Story = {
  args: {
    url: '',
    className: 'p-4',
  },
}

// With custom className
export const WithCustomStyling: Story = {
  args: {
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    className: 'p-8 border-2 border-gray-300 rounded-lg',
  },
}
