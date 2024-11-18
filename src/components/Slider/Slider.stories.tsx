import { Meta, StoryObj } from '@storybook/react'
import { Slider } from './Slider'

const meta = {
  title: 'Components/Slider',
  component: Slider,
} satisfies Meta<typeof Slider>

export default meta

type Story = StoryObj<typeof meta>

export const SliderDemo: Omit<Story, 'args'> = {
  render: () => <Slider defaultValue={[20]} />,
}
