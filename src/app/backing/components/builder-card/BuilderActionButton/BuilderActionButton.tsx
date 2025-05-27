import { Button } from '@/components/Button'
import { FC } from 'react'

interface BuilderActionButtonProps {
  onClick: () => void
  text: string
  testId?: string
}

export const BuilderActionButton: FC<BuilderActionButtonProps> = ({ onClick, text, testId = '' }) => {
  return (
    <Button
      variant="secondary"
      className="my-6 border-[#66605C] px-2 py-1"
      textClassName="text-[14px] font-normal"
      onClick={onClick}
      data-testid={`${testId}builderActionButton`}
    >
      {text}
    </Button>
  )
}
