import { Button } from '@/components/Button'
import { Span } from '@/components/Typography'

export interface PercentageButtonItem<T> {
  value: T
  label: string
  testId?: string
}

const DEFAULT_PERCENTAGE_OPTIONS: PercentageButtonItem<number>[] = [
  { value: 0.1, label: '10%', testId: '10Button' },
  { value: 0.2, label: '20%', testId: '20Button' },
  { value: 0.5, label: '50%', testId: '50Button' },
  { value: 1, label: 'Max', testId: 'MaxButton' },
]

interface PercentageButtonsProps<T> {
  onPercentageClick: (value: T) => void
  options?: PercentageButtonItem<T>[]
  value?: T | null
  testId?: string
}

export const PercentageButtons = <T extends string | number>({
  onPercentageClick,
  options = DEFAULT_PERCENTAGE_OPTIONS as PercentageButtonItem<T>[],
  value = null,
  testId,
}: PercentageButtonsProps<T>) => (
  <div className="flex gap-1" data-testid={testId}>
    {options.map(option => {
      const isSelected = value === option.value
      return (
        <Button
          key={String(option.value)}
          variant={isSelected ? 'primary' : 'secondary'}
          onClick={() => onPercentageClick(option.value)}
          className={isSelected ? 'px-2 py-0' : 'bg-transparent border border-bg-40 px-2 py-0'}
          data-testid={option.testId}
        >
          <Span variant="body-s">{option.label}</Span>
        </Button>
      )
    })}
  </div>
)
