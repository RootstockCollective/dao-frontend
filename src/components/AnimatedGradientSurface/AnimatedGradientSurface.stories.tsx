import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'

import { Button } from '@/components/Button'
import { Header, Paragraph } from '@/components/Typography'

import { AnimatedGradientSurface } from './AnimatedGradientSurface'

const meta: Meta<typeof AnimatedGradientSurface> = {
  title: 'Koto/AnimatedGradientSurface',
  component: AnimatedGradientSurface,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    step: { control: { type: 'number', min: 0, max: 2 } },
  },
}

export default meta
type Story = StoryObj<typeof meta>

export const StepOne: Story = {
  args: { step: 0, className: 'h-[540px] w-[420px] rounded' },
}

export const StepTwo: Story = {
  args: { step: 1, className: 'h-[540px] w-[420px] rounded' },
}

export const StepThree: Story = {
  args: { step: 2, className: 'h-[540px] w-[420px] rounded' },
}

/** The gradient travels between poses instead of cutting — step through it to see the motion. */
export const SteppingThrough: Story = {
  render: () => {
    const [step, setStep] = useState(0)

    return (
      <div className="flex flex-col items-center gap-4">
        <AnimatedGradientSurface step={step} className="h-[540px] w-[420px] rounded" />
        <div className="flex flex-row gap-2">
          <Button variant="secondary-outline" onClick={() => setStep(current => Math.max(0, current - 1))}>
            Back
          </Button>
          <Button onClick={() => setStep(current => Math.min(2, current + 1))}>Next</Button>
        </div>
      </div>
    )
  },
}

/** Content sits above the gradient on its own layer. */
export const WithContent: Story = {
  render: () => (
    <AnimatedGradientSurface step={0} className="h-[540px] w-[420px] rounded">
      <div className="flex h-full flex-col justify-end p-6">
        <Header variant="e3" caps className="text-text-100">
          Your wallet
        </Header>
        <Paragraph variant="body-s" className="text-text-100">
          You need RIF to stake
        </Paragraph>
      </div>
    </AnimatedGradientSurface>
  ),
}
