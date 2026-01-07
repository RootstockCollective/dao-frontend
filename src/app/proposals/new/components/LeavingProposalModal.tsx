import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import type { ModalProps } from '@/components/Modal/Modal'
import { Paragraph } from '@/components/Typography'
import { cn } from '@/lib/utils'
import { Separator } from '@radix-ui/react-select'

interface Props extends Omit<ModalProps, 'children' | 'onClose'> {
  onStay: () => void // Function to call when user wants to STAY on the current page ("Take me back")
  onProceedWithExit: () => void // Function to call when user wants to PROCEED with the exit ("Cancel proposal")
}

export const LeavingProposalModal = ({ className, onStay, onProceedWithExit }: Props) => {
  return (
    <Modal onClose={onStay} className="w-full max-w-lg">
      <div className={cn('h-full p-6 flex flex-col !w-full', className)}>
        <div className="grow">
          <Paragraph variant="body-l" className="mt-10">
            Moving away from the proposal creation process will cancel it
          </Paragraph>
        </div>
        <div className="flex flex-col">
          <Separator className="bg-bg-60 h-[1px] w-full mt-14" />
          <div className="flex mt-6 self-center md:self-end gap-2 md:gap-4">
            <Button
              onClick={onProceedWithExit}
              variant="transparent"
              className="border-text-100 border-solid border-[1px] whitespace-nowrap"
              data-testid="CancelProposalButton"
            >
              Cancel proposal
            </Button>
            <Button className="whitespace-nowrap" onClick={onStay} data-testid="TakeMeBackButton">
              Take me back
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
