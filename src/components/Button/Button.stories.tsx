import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '@/components/Button'
import { ButtonVariants } from '@/components/Button/types'
import { GithubIcon as StarIcon, SortDescendingIcon as PlusIcon } from '@/components/Icons'

const meta = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    children: {
      control: 'text',
      description: 'Button text content',
    },
    variant: {
      control: 'select',
      options: [
        'primary',
        'primary-new',
        'secondary',
        'secondary-full',
        'white',
        'white-new',
        'borderless',
        'outlined',
        'pagination',
        'pagination-active',
      ] as ButtonVariants[],
      description: 'Button variant/style',
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler function',
    },
    startIcon: {
      control: false,
      description: 'Icon element to display at the start of the button',
    },
    fullWidth: {
      control: 'boolean',
      description: 'Whether button should take full width of container',
    },
    centerContent: {
      control: 'boolean',
      description: 'Whether to center the button content',
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
    loading: {
      control: 'boolean',
      description: 'Whether the button is in loading state (shows spinner)',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for the button',
    },
    textClassName: {
      control: 'text',
      description: 'Additional CSS classes for the button text',
    },
    startIconClasses: {
      control: 'text',
      description: 'Additional CSS classes for the start icon',
    },
    'data-testid': {
      control: 'text',
      description: 'Test ID for the button',
    },
    buttonProps: {
      control: false,
      description: 'Additional button HTML attributes',
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

// Basic Variants
export const Default: Story = {
  args: {
    children: 'Button',
    onClick: () => console.log('Button clicked'),
  },
}

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'primary',
    onClick: () => console.log('Primary clicked'),
  },
}

export const PrimaryNew: Story = {
  args: {
    children: 'Primary New Button',
    variant: 'primary-new',
    onClick: () => console.log('Primary new clicked'),
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
    onClick: () => console.log('Secondary clicked'),
  },
}

export const SecondaryFull: Story = {
  args: {
    children: 'Secondary Full Button',
    variant: 'secondary-full',
    onClick: () => console.log('Secondary full clicked'),
  },
}

export const White: Story = {
  args: {
    children: 'White Button',
    variant: 'white',
    onClick: () => console.log('White clicked'),
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
}

export const WhiteNew: Story = {
  args: {
    children: 'White New Button',
    variant: 'white-new',
    onClick: () => console.log('White new clicked'),
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
}

export const Borderless: Story = {
  args: {
    children: 'Borderless Button',
    variant: 'borderless',
    onClick: () => console.log('Borderless clicked'),
  },
}

export const Outlined: Story = {
  args: {
    children: 'Outlined Button',
    variant: 'outlined',
    onClick: () => console.log('Outlined clicked'),
  },
}

export const Pagination: Story = {
  args: {
    children: '1',
    variant: 'pagination',
    onClick: () => console.log('Pagination clicked'),
  },
}

export const PaginationActive: Story = {
  args: {
    children: '2',
    variant: 'pagination-active',
    onClick: () => console.log('Pagination active clicked'),
  },
}

// Icon Variants
export const WithStartIcon: Story = {
  args: {
    children: 'With Icon',
    startIcon: <StarIcon />,
    onClick: () => console.log('Icon button clicked'),
  },
}

export const WithStartIconSecondary: Story = {
  args: {
    children: 'Add Item',
    variant: 'secondary',
    startIcon: <PlusIcon />,
    onClick: () => console.log('Add item clicked'),
  },
}

export const WithStartIconWhite: Story = {
  args: {
    children: 'White with Icon',
    variant: 'white',
    startIcon: <StarIcon />,
    onClick: () => console.log('White icon clicked'),
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
}

// State Variants
export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
    onClick: () => console.log('This should not trigger'),
  },
}

export const DisabledWithIcon: Story = {
  args: {
    children: 'Disabled with Icon',
    disabled: true,
    startIcon: <StarIcon />,
    onClick: () => console.log('This should not trigger'),
  },
}

export const Loading: Story = {
  args: {
    children: 'Loading...',
    loading: true,
    onClick: () => console.log('Loading clicked'),
  },
}

export const LoadingWithIcon: Story = {
  args: {
    children: 'Processing',
    loading: true,
    startIcon: <PlusIcon />, // This will be replaced by spinner
    onClick: () => console.log('Loading with icon clicked'),
  },
}

// Layout Variants
export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
    onClick: () => console.log('Full width clicked'),
  },
}

export const FullWidthWithIcon: Story = {
  args: {
    children: 'Full Width with Icon',
    fullWidth: true,
    startIcon: <StarIcon />,
    onClick: () => console.log('Full width icon clicked'),
  },
}

export const LeftAligned: Story = {
  args: {
    children: 'Left Aligned',
    centerContent: false,
    fullWidth: true,
    onClick: () => console.log('Left aligned clicked'),
  },
}

export const LeftAlignedWithIcon: Story = {
  args: {
    children: 'Left Aligned with Icon',
    centerContent: false,
    fullWidth: true,
    startIcon: <PlusIcon />,
    onClick: () => console.log('Left aligned icon clicked'),
  },
}

// Content Variants
export const WithLongContent: Story = {
  args: {
    children: 'This is a very long button text that might wrap or overflow depending on the container width',
    onClick: () => console.log('Long content clicked'),
  },
}

export const WithShortContent: Story = {
  args: {
    children: 'OK',
    onClick: () => console.log('Short content clicked'),
  },
}

export const WithLongContentFullWidth: Story = {
  args: {
    children: 'This is a full width button with very long content that demonstrates text wrapping behavior',
    fullWidth: true,
    onClick: () => console.log('Long content full width clicked'),
  },
}

// Custom Styling Variants
export const WithCustomClassName: Story = {
  args: {
    children: 'Custom Styled',
    className: 'shadow-lg hover:shadow-xl transition-shadow',
    onClick: () => console.log('Custom styled clicked'),
  },
}

export const WithCustomTextClassName: Story = {
  args: {
    children: 'Custom Text Style',
    textClassName: 'uppercase tracking-wider',
    onClick: () => console.log('Custom text clicked'),
  },
}

export const WithCustomIconClasses: Story = {
  args: {
    children: 'Custom Icon Style',
    startIcon: <StarIcon />,
    startIconClasses: 'text-yellow-400',
    onClick: () => console.log('Custom icon style clicked'),
  },
}

// Button Props Variants
export const WithButtonProps: Story = {
  args: {
    children: 'With Button Props',
    buttonProps: {
      id: 'custom-button',
      'aria-label': 'Custom button with additional props',
      title: 'This button has custom HTML attributes',
    },
    onClick: () => console.log('Button props clicked'),
  },
}

export const WithDataTestId: Story = {
  args: {
    children: 'Test Button',
    'data-testid': 'custom-test-button',
    onClick: () => console.log('Test button clicked'),
  },
}

// Edge Cases
export const AllVariantComparison: Story = {
  args: {
    children: '',
  },
  render: () => (
    <div className="flex flex-wrap gap-4 p-4">
      <Button variant="primary" onClick={() => console.log('Primary')}>
        Primary
      </Button>
      <Button variant="primary-new" onClick={() => console.log('Primary New')}>
        Primary New
      </Button>
      <Button variant="secondary" onClick={() => console.log('Secondary')}>
        Secondary
      </Button>
      <Button variant="secondary-full" onClick={() => console.log('Secondary Full')}>
        Secondary Full
      </Button>
      <Button variant="white" onClick={() => console.log('White')}>
        White
      </Button>
      <Button variant="white-new" onClick={() => console.log('White New')}>
        White New
      </Button>
      <Button variant="borderless" onClick={() => console.log('Borderless')}>
        Borderless
      </Button>
      <Button variant="outlined" onClick={() => console.log('Outlined')}>
        Outlined
      </Button>
      <Button variant="pagination" onClick={() => console.log('Pagination')}>
        1
      </Button>
      <Button variant="pagination-active" onClick={() => console.log('Pagination Active')}>
        2
      </Button>
    </div>
  ),
  parameters: {
    controls: { disable: true },
  },
}

export const PaginationExample: Story = {
  args: {
    children: '',
  },
  render: () => (
    <div className="flex gap-1 p-4">
      <Button variant="pagination" onClick={() => console.log('Page 1')}>
        1
      </Button>
      <Button variant="pagination-active" onClick={() => console.log('Page 2')}>
        2
      </Button>
      <Button variant="pagination" onClick={() => console.log('Page 3')}>
        3
      </Button>
      <Button variant="pagination" onClick={() => console.log('Page 4')}>
        4
      </Button>
      <Button variant="pagination" onClick={() => console.log('Page 5')}>
        5
      </Button>
    </div>
  ),
  parameters: {
    controls: { disable: true },
  },
}

export const ResponsiveBehavior: Story = {
  args: {
    children: '',
  },
  render: () => (
    <div className="space-y-4 p-4">
      <div className="w-full max-w-xs">
        <h3 className="mb-2 text-sm font-bold">Mobile Width (320px max)</h3>
        <Button fullWidth onClick={() => console.log('Mobile')}>
          Mobile Button
        </Button>
      </div>
      <div className="w-full max-w-md">
        <h3 className="mb-2 text-sm font-bold">Tablet Width (448px max)</h3>
        <Button fullWidth onClick={() => console.log('Tablet')}>
          Tablet Button
        </Button>
      </div>
      <div className="w-full max-w-4xl">
        <h3 className="mb-2 text-sm font-bold">Desktop Width</h3>
        <Button fullWidth onClick={() => console.log('Desktop')}>
          Desktop Button
        </Button>
      </div>
    </div>
  ),
  parameters: {
    controls: { disable: true },
  },
}
