import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { AlwaysEnabledButton } from './AlwaysEnabledButton'

const meta: Meta<typeof AlwaysEnabledButton> = {
  title: 'Components/AlwaysEnabledButton',
  component: AlwaysEnabledButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    conditionPairs: {
      control: false,
      description: 'Array of condition-tooltip pairs that determine when tooltips should show',
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'secondary-outline', 'transparent'],
      description: 'Button variant style',
    },
    children: {
      control: 'text',
      description: 'Button content',
    },
    className: {
      control: 'text',
      description: 'Additional CSS classes',
    },
    tooltipProps: {
      control: false,
      description: 'Additional props for the tooltip component',
    },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Always Enabled Button',
    conditionPairs: [],
    variant: 'primary',
  },
}

export const WithTooltipWhenConditionMet: Story = {
  args: {
    children: 'Button with Tooltip',
    variant: 'primary',
    conditionPairs: [
      {
        condition: () => true, // Always show tooltip
        lazyContent: () => 'This tooltip is always shown because the condition is always true',
      },
    ],
  },
}

export const WithTooltipWhenConditionNotMet: Story = {
  args: {
    children: 'Button without Tooltip',
    variant: 'primary',
    conditionPairs: [
      {
        condition: () => false, // Never show tooltip
        lazyContent: () => 'This tooltip will never show because the condition is always false',
      },
    ],
  },
}

export const WithMultipleConditions: Story = {
  render: () => {
    const [activeCondition, setActiveCondition] = useState(0)

    const conditions = [
      {
        name: 'No Condition Met',
        condition: () => false,
        tooltip: 'This tooltip should never show',
      },
      {
        name: 'First Condition',
        condition: () => activeCondition === 1,
        tooltip: 'First condition is active - showing first tooltip!',
      },
      {
        name: 'Second Condition',
        condition: () => activeCondition === 2,
        tooltip: 'Second condition is active - showing second tooltip!',
      },
      {
        name: 'Both Conditions',
        condition: () => activeCondition === 3,
        tooltip: 'Multiple conditions met - this shows first due to priority',
      },
    ]

    const conditionPairs = [
      {
        condition: () => activeCondition === 1 || activeCondition === 3,
        lazyContent: () => 'First tooltip - higher priority condition met!',
      },
      {
        condition: () => activeCondition === 2 || activeCondition === 3,
        lazyContent: () => 'Second tooltip - lower priority condition met!',
      },
    ]

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="text-sm text-gray-600 mb-2">
          Current state: <strong>{conditions[activeCondition].name}</strong>
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          {conditions.map((condition, index) => (
            <button
              key={index}
              onClick={() => setActiveCondition(index)}
              className={`px-3 py-1 rounded text-sm transition-colors ${
                activeCondition === index
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-300 text-gray-800 hover:bg-gray-400'
              }`}
            >
              {condition.name}
            </button>
          ))}
        </div>

        <AlwaysEnabledButton
          variant="secondary"
          conditionPairs={conditionPairs}
          tooltipProps={{
            side: 'right',
          }}
        >
          Multi-condition Button
        </AlwaysEnabledButton>

        <div className="text-xs text-gray-500 max-w-md text-center mt-2">
          <div>
            • <strong>No Condition Met:</strong> No tooltip
          </div>
          <div>
            • <strong>First Condition:</strong> Shows first tooltip
          </div>
          <div>
            • <strong>Second Condition:</strong> Shows second tooltip
          </div>
          <div>
            • <strong>Both Conditions:</strong> Shows first tooltip (higher priority)
          </div>
        </div>
      </div>
    )
  },
}

export const InteractiveExample: Story = {
  render: () => {
    const [showTooltip, setShowTooltip] = useState(false)
    const [counter, setCounter] = useState(0)

    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setShowTooltip(!showTooltip)}
            className="px-3 py-1 bg-gray-300 text-gray-800 hover:bg-gray-400 rounded text-sm"
          >
            Toggle Tooltip: {showTooltip ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => setCounter(c => c + 1)}
            className="px-3 py-1 bg-gray-300 text-gray-800 hover:bg-gray-400 rounded text-sm"
          >
            Count: {counter}
          </button>
        </div>

        <AlwaysEnabledButton
          variant="primary"
          conditionPairs={[
            {
              condition: () => showTooltip,
              lazyContent: () => `Tooltip is enabled! Counter: ${counter}`,
            },
          ]}
          tooltipProps={{
            side: 'bottom',
          }}
          onClick={() => setCounter(c => c + 1)}
        >
          Interactive Button
        </AlwaysEnabledButton>
      </div>
    )
  },
}

export const DifferentVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <AlwaysEnabledButton
        variant="primary"
        conditionPairs={[
          {
            condition: () => true,
            lazyContent: () => 'Primary button with tooltip',
          },
        ]}
      >
        Primary Button
      </AlwaysEnabledButton>

      <AlwaysEnabledButton
        variant="secondary"
        conditionPairs={[
          {
            condition: () => true,
            lazyContent: () => 'Secondary button with tooltip',
          },
        ]}
      >
        Secondary Button
      </AlwaysEnabledButton>

      <AlwaysEnabledButton
        variant="secondary-outline"
        conditionPairs={[
          {
            condition: () => true,
            lazyContent: () => 'Secondary outline button with tooltip',
          },
        ]}
      >
        Secondary Outline Button
      </AlwaysEnabledButton>

      <AlwaysEnabledButton
        variant="transparent"
        conditionPairs={[
          {
            condition: () => true,
            lazyContent: () => 'Transparent button with tooltip',
          },
        ]}
      >
        Transparent Button
      </AlwaysEnabledButton>
    </div>
  ),
}

export const WithComplexTooltipContent: Story = {
  args: {
    children: 'Complex Tooltip',
    variant: 'primary',
    conditionPairs: [
      {
        condition: () => true,
        lazyContent: () => (
          <div className="flex flex-col gap-2">
            <div className="font-bold">Complex Tooltip Content</div>
            <div>• Point one</div>
            <div>• Point two</div>
            <div>• Point three</div>
          </div>
        ),
      },
    ],
  },
}

export const WithCustomTooltipProps: Story = {
  args: {
    children: 'Custom Tooltip Position',
    variant: 'secondary',
    conditionPairs: [
      {
        condition: () => true,
        lazyContent: () => 'This tooltip is positioned to the right!',
      },
    ],
    tooltipProps: {
      side: 'right',
      align: 'start',
    },
  },
}
