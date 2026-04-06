import { ReactElement } from 'react'

import { Button } from '@/components/Button'
import { CommonComponentProps } from '@/components/commonProps'
import { Paragraph, Span } from '@/components/Typography'

type SiweTooltipContentProps = CommonComponentProps<HTMLButtonElement> & {
  error?: Error | null
}

export const SiweTooltipContent = ({ onClick, error }: SiweTooltipContentProps): ReactElement => (
  <div className="flex flex-col items-start p-6 gap-2 self-stretch rounded-sm bg-v3-text-80 text-shadow-[0_8px_24px_0_rgba(23,20,18,0.14)]">
    <div className="flex flex-col items-start gap-3 w-56">
      <Paragraph className="text-v3-bg-accent-100 font-rootstock-sans text-sm font-normal leading-[145%] not-italic">
        Sign in to like and view your reactions
      </Paragraph>
      {error?.message ? (
        <Paragraph
          className="text-red-300 font-rootstock-sans text-xs font-normal leading-[145%] not-italic line-clamp-3"
          role="alert"
        >
          {error.message}
        </Paragraph>
      ) : null}
      <Button
        onClick={onClick}
        variant="secondary-outline"
        className="flex h-[1.75rem] p-[0.25rem_0.5rem] items-center gap-[0.5rem] rounded-sm border border-bg-40 px-2 py-1.5"
      >
        <Span className="text-v3-bg-accent-100 font-rootstock-sans not-italic text-sm font-normal leading-[145%]">
          Authenticate with SIWE
        </Span>
      </Button>
    </div>
  </div>
)
