import { Button } from '@/components/ButtonNew/Button'
import { Span } from '@/components/TypographyNew'

interface Props {
  onPercentageClick: (percentage: number) => void
}

type PercentageOption = {
  value: number
  label: string
  testId: string
}

const PERCENTAGE_OPTIONS: PercentageOption[] = [
  { value: 0.1, label: '10%', testId: '10Button' },
  { value: 0.2, label: '20%', testId: '20Button' },
  { value: 0.5, label: '50%', testId: '50Button' },
  { value: 1, label: 'Max', testId: 'MaxButton' },
]

export const PercentageButtons = ({ onPercentageClick }: Props) => (
  <>
    {PERCENTAGE_OPTIONS.map(({ value, label, testId }) => (
      <Button
        key={label}
        variant="secondary"
        onClick={() => onPercentageClick(value)}
        className="bg-transparent border border-bg-40 px-2 py-0"
        data-testid={testId}
      >
        <Span variant="body-s">{label}</Span>
      </Button>
    ))}
  </>
)
