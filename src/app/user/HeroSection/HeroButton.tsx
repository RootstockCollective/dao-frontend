import { Button } from '@/components/Button'
import { CommonComponentProps } from '@/components/commonProps'

interface HeroButtonProps extends CommonComponentProps<HTMLButtonElement> {
  text: string
}

export const HeroButton = ({ text, onClick }: HeroButtonProps) => (
  <Button variant="outlined" onClick={onClick} data-testid={text}>
    {text}
  </Button>
)
