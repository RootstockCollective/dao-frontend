import { Button } from '@/components/Button'

interface HeroButtonProps {
  text: string
  onClick: () => void
}

export const HeroButton = ({ text, onClick }: HeroButtonProps) => (
  <Button variant="outlined" onClick={onClick} data-testid={text}>
    {text}
  </Button>
)
