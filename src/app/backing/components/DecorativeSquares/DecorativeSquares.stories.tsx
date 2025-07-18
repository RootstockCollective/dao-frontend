import { DecorativeSquares } from './DecorativeSquares'
import type { Meta, StoryObj } from '@storybook/react'

const meta: Meta<typeof DecorativeSquares> = {
  title: 'Components/Backing/DecorativeSquares',
  component: DecorativeSquares,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A decorative SVG component featuring squares with gradient backgrounds, used for visual enhancement in the backing section.',
      },
    },
  },
  argTypes: {
    width: {
      control: { type: 'number' },
      description: 'Width of the SVG in pixels',
    },
    height: {
      control: { type: 'number' },
      description: 'Height of the SVG in pixels',
    },
    color: {
      control: { type: 'color' },
      description: 'Color of the icon (affects fill if not overridden)',
    },
    fill: {
      control: { type: 'color' },
      description: 'Fill color of the SVG elements',
    },
    'aria-label': {
      control: { type: 'text' },
      description: 'Accessibility label for screen readers',
    },
  },
  args: {
    width: 50,
    height: 40,
    color: '#1E1E1E',
    'aria-label': 'Decorative Squares Icon',
  },
}

export default meta

type Story = StoryObj<typeof DecorativeSquares>

export const Default: Story = {
  args: {},
}

export const Large: Story = {
  args: {
    width: 100,
    height: 80,
  },
}

export const Small: Story = {
  args: {
    width: 25,
    height: 20,
  },
}

export const CustomColors: Story = {
  args: {
    width: 75,
    height: 60,
    color: '#FF6B6B',
    fill: '#4ECDC4',
  },
}

export const DarkTheme: Story = {
  args: {
    width: 60,
    height: 48,
    color: '#2C2C2C',
    fill: '#4A4A4A',
  },
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
}

export const LightTheme: Story = {
  args: {
    width: 60,
    height: 48,
    color: '#F5F5F5',
    fill: '#E0E0E0',
  },
  parameters: {
    backgrounds: {
      default: 'light',
    },
  },
}

export const Responsive: Story = {
  args: {
    width: '100%',
    height: 'auto',
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}

export const WithCustomAriaLabel: Story = {
  args: {
    'aria-label': 'Decorative background pattern for backing section',
  },
}

export const Interactive: Story = {
  args: {
    width: 80,
    height: 64,
  },
  parameters: {
    docs: {
      description: {
        story:
          'This variant shows the component with interactive controls. Try adjusting the width, height, and colors using the controls panel.',
      },
    },
  },
}
