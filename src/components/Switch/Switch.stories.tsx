import { Meta, StoryObj } from '@storybook/nextjs'
import { Switch, SwitchThumb } from './Switch'

const meta = {
  title: 'Components/Switch',
  component: Switch,
} satisfies Meta<typeof Switch>

export default meta

type Story = StoryObj<typeof meta>

export const SwitchDemo: Omit<Story, 'args'> = {
  render: () => (
    <Switch>
      <SwitchThumb />
    </Switch>
  ),
}
