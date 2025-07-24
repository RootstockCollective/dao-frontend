import { Button } from '@/components/ButtonNew'
import { Modal } from '@/components/Modal'
import { ModalProps } from '@/components/Modal/Modal'
import { Paragraph } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'
import { Separator } from '@radix-ui/react-select'

interface Props extends Omit<ModalProps, 'children' | 'onClose'> {
  onStay: () => void // Function to call when user wants to STAY on the current page ("Take me back")
  onProceedWithExit: () => void // Function to call when user wants to PROCEED with the exit ("Cancel proposal")
}

export const LeavingProposalModal = ({ className, onStay, onProceedWithExit }: Props) => {
  return (
    <Modal onClose={onStay}>
      <div className={cn('p-6 flex flex-col', className)}>
        <Paragraph variant="body-l" className="mt-10">
          Moving away from the proposal creation process will cancel it
        </Paragraph>
        <Separator className="bg-bg-60 h-[1px] w-full mt-14" />
        <div className="flex mt-6 self-end">
          <Button
            onClick={onProceedWithExit}
            variant="transparent"
            className="border-text-100 border-solid border-[1px]"
          >
            Cancel proposal
          </Button>
          <Button className="ml-4" onClick={onStay}>
            Take me back
          </Button>
        </div>
      </div>
    </Modal>
  )
}
