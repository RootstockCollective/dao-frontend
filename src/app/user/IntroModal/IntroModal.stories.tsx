import type { Meta, StoryObj } from '@storybook/nextjs'

import { useIntroSteps } from './hooks/useIntroSteps'
import { IntroModalContent } from './IntroModalContent'

const meta: Meta<typeof IntroModalContent> = {
  title: 'Koto/DAO/IntroModal',
  component: IntroModalContent,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
}

export default meta

interface ScenarioArgs {
  needsRif: boolean
  needsGas: boolean
  rifBalance: string
  rbtcBalance: string
}

/**
 * Stories are written per balance scenario rather than per status, because the step list is
 * derived from balances now. Note the gradient is static here: framer-motion animations do not
 * run in this Storybook instance.
 */
const Scenario = ({ needsRif, needsGas, rifBalance, rbtcBalance }: ScenarioArgs) => {
  const wizard = useIntroSteps({ needsRif, needsGas })

  return (
    <IntroModalContent
      wizard={wizard}
      rifBalance={rifBalance}
      rbtcBalance={rbtcBalance}
      needsRif={needsRif}
      needsGas={needsGas}
      minGas="0.0002"
      onOpenProvider={url => console.log('open', url)}
      onSkip={() => console.log('skip')}
      onStake={() => console.log('stake')}
      onClose={() => console.log('close')}
    />
  )
}

type Story = StoryObj<ScenarioArgs>

/** Nothing in the wallet: RIF, then gas, then the summary. */
export const NeedsRifAndGas: Story = {
  render: () => <Scenario needsRif needsGas rifBalance="0" rbtcBalance="0" />,
}

/** Has gas already, so the flow is two steps and never mentions gas. */
export const NeedsRifOnly: Story = {
  render: () => <Scenario needsRif needsGas={false} rifBalance="0" rbtcBalance="0.004" />,
}

/** Holds RIF but cannot pay for the approve — the case the old design had no screen for. */
export const NeedsGasOnly: Story = {
  render: () => <Scenario needsRif={false} needsGas rifBalance="1250.5" rbtcBalance="0.00006" />,
}

/** Everything present: a single summary step, so the step indicator is hidden. */
export const ReadyToStake: Story = {
  render: () => <Scenario needsRif={false} needsGas={false} rifBalance="1250.5" rbtcBalance="0.004" />,
}
