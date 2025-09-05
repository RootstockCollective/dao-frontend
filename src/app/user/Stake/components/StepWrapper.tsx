import { Header, Paragraph } from '@/components/Typography'
import { ProgressBar } from '@/components/ProgressBarNew'
import { useMemo, useState } from 'react'
import { StakeSteps } from '../Steps/StakeSteps'
import { Modal } from '@/components/Modal'
import { stepConfig } from '../Steps/stepConfig'
import { useSteps } from '../hooks/useSteps'
import { StepActionButtons } from './StepActionButtons'
import { Divider } from '@/components/Divider'
import { useIsDesktop } from '@/shared/hooks/useIsDesktop'
import { NewPopover } from '@/components/NewPopover'
import { Span, Paragraph as ParagraphComponent } from '@/components/Typography'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface StepWrapperProps {
  onCloseModal: () => void
}

export const StepWrapper = ({ onCloseModal }: StepWrapperProps) => {
  const isDesktop = useIsDesktop()
  const [helpPopoverOpen, setHelpPopoverOpen] = useState(false)

  // UI Logic: Handle step management internally
  const { step, ...stepFunctions } = useSteps(stepConfig.length)

  // UI Logic: Read step config and render component
  const stepConfigItem = useMemo(() => stepConfig[step], [step])
  const StepComponent = useMemo(() => stepConfigItem.component, [stepConfigItem.component])

  const { progress, description } = stepConfigItem

  return (
    <Modal onClose={onCloseModal} fullscreen={!isDesktop}>
      <div className={cn('h-full flex flex-col', !isDesktop ? 'p-4' : 'p-6')}>
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
          <StepComponent {...stepFunctions} onCloseModal={onCloseModal} />
        </div>

        {/* Footer with buttons */}
        <div className="mt-8">
          {/* Help Popover - above divider on mobile, left of buttons on desktop */}
          {!isDesktop && step === 1 && (
            <HelpPopover open={helpPopoverOpen} onOpenChange={setHelpPopoverOpen} />
          )}
          <Divider />
          <StepActionButtons
            leftContent={
              isDesktop &&
              step === 1 && <HelpPopover open={helpPopoverOpen} onOpenChange={setHelpPopoverOpen} />
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
          <Image src="/images/info-icon-sm.svg" alt="info" width={20} height={20} />
          <Span variant="tag-s">Help, I don&apos;t understand</Span>
        </a>
      }
      content={<HelpPopoverContent />}
      className="rounded-none bg-transparent shadow-none"
      style={{ zIndex: 9999 }}
      contentStyle={{ zIndex: 9999 }}
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
