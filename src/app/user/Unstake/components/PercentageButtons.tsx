import { Button } from '@/components/ButtonNew/Button'
import { Span } from '@/components/TypographyNew'

interface Props {
  onPercentageClick: (percentage: number) => void
}

export const PercentageButtons = ({ onPercentageClick }: Props) => (
  <>
    <Button
      variant="secondary"
      onClick={() => onPercentageClick(0.1)}
      className="bg-transparent border border-bg-40 px-2 py-0"
    >
      <Span variant="body-s">10%</Span>
    </Button>
    <Button
      variant="secondary"
      onClick={() => onPercentageClick(0.2)}
      className="bg-transparent border border-bg-40 px-2 py-0"
    >
      <Span variant="body-s">20%</Span>
    </Button>
    <Button
      variant="secondary"
      onClick={() => onPercentageClick(0.5)}
      className="bg-transparent border border-bg-40 px-2 py-0"
    >
      <Span variant="body-s">50%</Span>
    </Button>
    <Button
      variant="secondary"
      onClick={() => onPercentageClick(1)}
      className="bg-transparent border border-bg-40 px-2 py-0"
      data-testid="maxButton"
    >
      <Span variant="body-s">Max</Span>
    </Button>
  </>
)
