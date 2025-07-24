import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ConditionalTooltip } from './ConditionalTooltip'

const meta: Meta<typeof ConditionalTooltip> = {
  title: 'Components/ConditionalTooltip',
  component: ConditionalTooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    conditionPairs: {
      control: false,
      description: 'Array of condition-tooltip pairs that determine when tooltips should show',
    },
    children: {
      control: false,
      description: 'The trigger element that will show the tooltip on hover',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes for the tooltip',
    },
    side: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Position of the tooltip relative to the trigger',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'Alignment of the tooltip',
    },
    sideOffset: {
      control: 'number',
      description: 'Distance between tooltip and trigger',
    },
    delayDuration: {
      control: 'number',
      description: 'Delay before showing tooltip in milliseconds',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    conditionPairs: [
      {
        condition: () => true,
        lazyContent: () => 'This is a basic conditional tooltip',
      },
    ],
    children: <div className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">Hover me</div>,
  },
}

export const NoConditionMet: Story = {
  args: {
    conditionPairs: [
      {
        condition: () => false,
        lazyContent: () => 'You should not see this tooltip',
      },
    ],
    children: <div className="px-4 py-2 bg-gray-500 text-white rounded cursor-pointer">No tooltip here</div>,
  },
}

export const MultipleConditionsWithPriority: Story = {
  args: {
    conditionPairs: [
      {
        condition: () => false,
        lazyContent: () => 'First condition (not met)',
      },
      {
        condition: () => true,
        lazyContent: () => 'Second condition (met) - This shows!',
      },
      {
        condition: () => true,
        lazyContent: () => 'Third condition (met but lower priority)',
      },
    ],
    children: (
      <div className="px-4 py-2 bg-green-500 text-white rounded cursor-pointer">Multiple conditions</div>
    ),
  },
}

export const InteractiveConditions: Story = {
  render: () => {
    const [condition1, setCondition1] = useState(false)
    const [condition2, setCondition2] = useState(false)
    const [condition3, setCondition3] = useState(true)

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setCondition1(!condition1)}
            className={`px-3 py-1 rounded text-sm border transition-colors ${
              condition1
                ? 'bg-red-500 text-white border-red-500'
                : 'bg-white text-gray-900 border-gray-400 hover:bg-gray-50'
            }`}
          >
            Condition 1: {condition1 ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setCondition2(!condition2)}
            className={`px-3 py-1 rounded text-sm border transition-colors ${
              condition2
                ? 'bg-blue-500 text-white border-blue-500'
                : 'bg-white text-gray-900 border-gray-400 hover:bg-gray-50'
            }`}
          >
            Condition 2: {condition2 ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setCondition3(!condition3)}
            className={`px-3 py-1 rounded text-sm border transition-colors ${
              condition3
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-white text-gray-900 border-gray-400 hover:bg-gray-50'
            }`}
          >
            Condition 3: {condition3 ? 'ON' : 'OFF'}
          </button>
        </div>

        <ConditionalTooltip
          className="bg-v3-bg-accent-20"
          conditionPairs={[
            {
              condition: () => condition1,
              lazyContent: () => (
                <div className="text-red-200">
                  🔴 <strong>Condition 1 Active</strong>
                  <br />
                  This is the highest priority tooltip
                </div>
              ),
            },
            {
              condition: () => condition2,
              lazyContent: () => (
                <div className="text-blue-200">
                  🔵 <strong>Condition 2 Active</strong>
                  <br />
                  This has medium priority
                </div>
              ),
            },
            {
              condition: () => condition3,
              lazyContent: () => (
                <div className="text-green-200">
                  🟢 <strong>Condition 3 Active</strong>
                  <br />
                  This has the lowest priority
                </div>
              ),
            },
          ]}
        >
          <div className="px-6 py-3 bg-purple-500 text-white rounded-lg cursor-pointer shadow-lg hover:bg-purple-600 transition-colors">
            Interactive Conditional Tooltip
          </div>
        </ConditionalTooltip>

        <div className="text-xs text-gray-600 max-w-md text-center">
          Toggle the conditions above to see how priority works. Higher conditions in the array take
          precedence over lower ones.
        </div>
      </div>
    )
  },
}

export const DifferentPositions: Story = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-8">
      <ConditionalTooltip
        conditionPairs={[
          {
            condition: () => true,
            lazyContent: () => 'Tooltip positioned at the top',
          },
        ]}
        side="top"
      >
        <div className="px-4 py-2 bg-blue-500 text-white rounded text-center">Top</div>
      </ConditionalTooltip>

      <ConditionalTooltip
        conditionPairs={[
          {
            condition: () => true,
            lazyContent: () => 'Tooltip positioned at the bottom',
          },
        ]}
        side="bottom"
      >
        <div className="px-4 py-2 bg-green-500 text-white rounded text-center">Bottom</div>
      </ConditionalTooltip>

      <ConditionalTooltip
        conditionPairs={[
          {
            condition: () => true,
            lazyContent: () => 'Tooltip positioned to the left',
          },
        ]}
        side="left"
      >
        <div className="px-4 py-2 bg-red-500 text-white rounded text-center">Left</div>
      </ConditionalTooltip>

      <ConditionalTooltip
        conditionPairs={[
          {
            condition: () => true,
            lazyContent: () => 'Tooltip positioned to the right',
          },
        ]}
        side="right"
      >
        <div className="px-4 py-2 bg-yellow-500 text-white rounded text-center">Right</div>
      </ConditionalTooltip>
    </div>
  ),
}

export const WithComplexContent: Story = {
  args: {
    className: 'bg-v3-bg-accent-60',
    conditionPairs: [
      {
        condition: () => true,
        lazyContent: () => (
          <div className="space-y-2">
            <div className="font-bold text-yellow-200">Complex Tooltip Content</div>
            <div className="border-t border-gray-400 pt-2">
              <ul className="list-disc list-inside space-y-1 text-sm text-v3-text-80">
                <li>First feature</li>
                <li>Second feature</li>
                <li>Third feature</li>
              </ul>
            </div>
            <div className="text-xs text-gray-300 border-t border-gray-400 pt-2">
              💡 Tip: You can include any React content here!
            </div>
          </div>
        ),
      },
    ],
    children: <div className="px-4 py-2 bg-indigo-500 text-white rounded cursor-pointer">Rich Content</div>,
  },
}

export const DynamicContent: Story = {
  render: () => {
    const [count, setCount] = useState(0)
    const [message, setMessage] = useState('Hello')

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setCount(c => c + 1)}
            className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 border border-blue-600"
          >
            Count: {count}
          </button>
          <input
            type="text"
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="px-2 py-1 border-2 border-gray-400 rounded text-sm text-gray-900 bg-white focus:border-blue-500 focus:outline-none"
            placeholder="Enter message"
          />
        </div>

        <ConditionalTooltip
          conditionPairs={[
            {
              condition: () => count > 0,
              lazyContent: () => (
                <div>
                  <div className="font-bold">{message}</div>
                  <div className="text-sm">Count: {count}</div>
                  <div className="text-xs text-v3-bg-accent-60">
                    Last updated: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              ),
            },
          ]}
        >
          <div className="px-4 py-2 bg-orange-500 text-white rounded cursor-pointer">
            Dynamic Content Tooltip
          </div>
        </ConditionalTooltip>

        <div className="text-xs text-gray-600 text-center">
          {count === 0 ? 'Click count button to show tooltip' : 'Tooltip content updates dynamically!'}
        </div>
      </div>
    )
  },
}

export const CustomStyling: Story = {
  args: {
    conditionPairs: [
      {
        condition: () => true,
        lazyContent: () => 'This tooltip has custom styling',
      },
    ],
    className: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-2 border-white shadow-2xl',
    children: <div className="px-4 py-2 bg-gray-800 text-white rounded cursor-pointer">Custom Styled</div>,
  },
}

export const WithDelayAndOffset: Story = {
  args: {
    conditionPairs: [
      {
        condition: () => true,
        lazyContent: () => 'This tooltip has a 1 second delay and larger offset',
      },
    ],
    delayDuration: 1000,
    sideOffset: 20,
    children: <div className="px-4 py-2 bg-teal-500 text-white rounded cursor-pointer">Delayed & Offset</div>,
  },
}
