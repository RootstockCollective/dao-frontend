import { Button } from '@/components/Button'
import { FC } from 'react'

interface BuilderActionButtonProps {
  onClick: () => void
  text: string
}

export const BuilderActionButton: FC<BuilderActionButtonProps> = ({ onClick, text }) => {
  return (
    <Button
      variant="secondary"
      className="my-6 border-[#66605C] px-2 py-1"
      textClassName="text-[14px] font-normal"
      onClick={onClick}
    >
      {text}
    </Button>
  )
}
