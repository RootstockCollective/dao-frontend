import { useMemo, useState } from 'react'

import { useIsAbiBoostEnabled } from '@/app/collective-rewards/abi-boost/hooks/useAbiBoost'
import { Divider } from '@/components/Divider'
import { InfoLabel } from '@/components/InfoLabel'
import { Modal } from '@/components/Modal'
import { NewPopover } from '@/components/NewPopover'
import { ProgressBar } from '@/components/ProgressBarNew'
import { StepActionButtons } from '@/components/StepActionButtons'
import { Header, Paragraph } from '@/components/Typography'
import { Paragraph as ParagraphComponent, Span } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { useSteps } from '@/shared/hooks/useSteps'

import { useStakingContext } from '../StakingContext'
import { StakeSteps } from '../Steps/StakeSteps'
import { stepConfig } from '../Steps/stepConfig'

interface StepWrapperProps {
  onCloseModal: () => void
  onBoostEligible?: (stakedAmount: string) => void
}

export const StepWrapper = ({ onCloseModal, onBoostEligible }: StepWrapperProps) => {
  const isDesktop = useIsDesktop()
  const [helpPopoverOpen, setHelpPopoverOpen] = useState(false)
  const { buttonActions } = useStakingContext()
  const isAbiBoostEnabled = useIsAbiBoostEnabled()

  // UI Logic: Handle step management internally
  const { step, ...stepFunctions } = useSteps(stepConfig.length)

  // UI Logic: Read step config and render component
  const stepConfigItem = useMemo(() => stepConfig[step], [step])
  const StepComponent = useMemo(() => stepConfigItem.component, [stepConfigItem.component])

  const { progress } = stepConfigItem
  const description = (isAbiBoostEnabled && stepConfigItem.boostDescription) || stepConfigItem.description
  const showsHelp = isAbiBoostEnabled || step === 1

  return (
    <Modal onClose={onCloseModal} data-testid="StakeModal">
      <div className="h-full flex flex-col p-4 md:p-6">
        <Header className="mt-16 mb-4">STAKE</Header>

        <div className="mb-12">
          <StakeSteps currentStep={step} />
          <ProgressBar progress={progress} className="mt-3" />
        </div>

        {description && (
          <Paragraph variant="body" className="mb-8">
            {description}
          </Paragraph>
        )}

        {/* Content area */}
        <div className="flex-1">
          <StepComponent {...stepFunctions} onCloseModal={onCloseModal} onBoostEligible={onBoostEligible} />
        </div>

        {/* Footer with buttons */}
        <div className="mt-8">
          {/* Help Popover - above divider on mobile, left of buttons on desktop */}
          {!isDesktop && showsHelp && (
            <HelpPopover open={helpPopoverOpen} onOpenChange={setHelpPopoverOpen} />
          )}
          <Divider />
          <StepActionButtons
            buttonActions={buttonActions}
            leftContent={
              isDesktop &&
              showsHelp && <HelpPopover open={helpPopoverOpen} onOpenChange={setHelpPopoverOpen} />
            }
          />
        </div>
      </div>
    </Modal>
  )
}

interface HelpPopoverProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const HelpPopover = ({ open, onOpenChange }: HelpPopoverProps) => {
  const isDesktop = useIsDesktop()

  return (
    <NewPopover
      open={open}
      onOpenChange={onOpenChange}
      anchor={
        <a
          href="#"
          className="flex items-center gap-1 cursor-pointer text-left no-underline hover:no-underline mb-4"
          onClick={e => {
            e.preventDefault()
            onOpenChange(!open)
          }}
        >
          <InfoLabel>Help, I don&apos;t understand</InfoLabel>
        </a>
      }
      content={<HelpPopoverContent />}
      className="rounded-none bg-transparent shadow-none"
      // Mobile: full width, Desktop: constrained width
      side={isDesktop ? 'top' : 'bottom'}
      align={isDesktop ? 'start' : 'center'}
    />
  )
}

const HelpPopoverContent = () => {
  const isDesktop = useIsDesktop()

  return (
    <div
      className={cn(
        'bg-text-80 rounded-lg p-4 flex flex-col gap-4',
        // Desktop: max-width with text wrapping, Mobile: full-width
        isDesktop ? 'max-w-[400px]' : 'max-w-[calc(100vw-2rem)]',
      )}
    >
      <div>
        <Span variant="tag-s" bold className="text-bg-100">
          Why request the allowance?
        </Span>
        <ParagraphComponent variant="body-s" className="mt-2 text-bg-60">
          Token allowances are the crypto equivalent to spending caps. You grant permissions for the dApp or
          smart contract to spend a specific amount of your tokens and not go over this amount without further
          approval. The Collective implements these as an industry standard to help protect you and the
          community.
        </ParagraphComponent>
      </div>
      <div>
        <Span variant="tag-s" bold className="text-bg-100">
          What is stRIF?
        </Span>
        <ParagraphComponent variant="body-s" className="mt-2 text-bg-60">
          The Governance token used in the Collective. You can stake any amount of RIF tokens and receive an
          equivalent amount of staked RIF as stRIF tokens (in a 1:1 ratio) and this is how you take part in
          the Collective. This is the way.
        </ParagraphComponent>
      </div>
    </div>
  )
}
