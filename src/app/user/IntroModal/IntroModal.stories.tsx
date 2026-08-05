import type { Meta, StoryObj } from '@storybook/nextjs'
import { useState } from 'react'
import type { Address } from 'viem'

import { useIntroSteps } from './hooks/useIntroSteps'
import { IntroModalContent } from './IntroModalContent'

const meta: Meta<typeof IntroModalContent> = {
  title: 'Koto/DAO/IntroModal',
  component: IntroModalContent,
  parameters: {
    layout: 'fullscreen',
    // Each story is a fullscreen portal, so the autodocs page would stack all of them on top
    // of one another and render as a single unreadable pile.
    docs: { disable: true },
  },
}

export default meta

const ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' as Address

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
  const [isRefreshing, setIsRefreshing] = useState(false)

  return (
    <IntroModalContent
      wizard={wizard}
      address={ADDRESS}
      rifBalance={rifBalance}
      rbtcBalance={rbtcBalance}
      needsRif={needsRif}
      needsGas={needsGas}
      minGas="0.0002"
      isRefreshing={isRefreshing}
      // Fakes the round trip so the "Checking your wallet…" state is reviewable here.
      onRefresh={() => {
        setIsRefreshing(true)
        setTimeout(() => setIsRefreshing(false), 1500)
      }}
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

/**
 * Everything present, so this is the single summary step: no step counter, no dots, no
 * "check again", and the copy switches to the variant that does not tell the user to wait for
 * funds that already landed.
 */
export const ReadyToStake: Story = {
  render: () => <Scenario needsRif={false} needsGas={false} rifBalance="1250.5" rbtcBalance="0.004" />,
}
