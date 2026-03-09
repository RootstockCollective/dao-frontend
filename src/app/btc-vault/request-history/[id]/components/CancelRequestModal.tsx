'use client'

import { Separator } from '@radix-ui/react-select'

import { Button } from '@/components/Button'
import { Modal } from '@/components/Modal'
import { Paragraph } from '@/components/Typography'

interface CancelRequestModalProps {
  onClose: () => void
  onConfirm: () => void
}

export function CancelRequestModal({ onClose, onConfirm }: CancelRequestModalProps) {
  return (
    <Modal onClose={onClose} data-testid="CancelRequestModal">
      <div className="h-full p-6 flex flex-col !w-full">
        <div className="grow">
          <Paragraph variant="body-l" className="mt-10 text-100 leading-[133%]">
            Are you sure you want to cancel this request?
          </Paragraph>
          <Paragraph variant="body" className="mt-4 text-100 leading-[150%]">
            Canceling will stop this request and it won&apos;t be processed. You can submit a new request
            anytime.
          </Paragraph>
        </div>
        <div className="flex flex-col">
          <Separator className="bg-bg-60 h-[1px] w-full mt-14" />
          <div className="flex mt-6 self-center md:self-end gap-2 md:gap-4">
            <Button
              onClick={onClose}
              variant="secondary-outline"
              className="whitespace-nowrap"
              data-testid="CancelRequestNevermind"
            >
              Nevermind
            </Button>
            <Button
              onClick={onConfirm}
              variant="primary"
              className="whitespace-nowrap"
              data-testid="CancelRequestConfirm"
            >
              Yes, cancel
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
