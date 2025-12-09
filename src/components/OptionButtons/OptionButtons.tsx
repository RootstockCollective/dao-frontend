import { Button } from '@/components/Button'
import { Span } from '@/components/Typography'

export interface OptionButtonItem<T> {
  value: T
  label: string
  testId?: string
}

interface OptionButtonsProps<T> {
  options: OptionButtonItem<T>[]
  value: T | null
  onChange: (value: T) => void
  testId?: string
}

export const OptionButtons = <T extends string | number>({
  options,
  value,
  onChange,
  testId,
}: OptionButtonsProps<T>) => (
  <div className="flex gap-1" data-testid={testId}>
    {options.map(option => {
      const isSelected = value === option.value
      return (
        <Button
          key={String(option.value)}
          variant={isSelected ? 'primary' : 'secondary'}
          onClick={() => onChange(option.value)}
          className={isSelected ? 'px-2 py-0' : 'bg-transparent border border-bg-40 px-2 py-0'}
          data-testid={option.testId}
        >
          <Span variant="body-s">{option.label}</Span>
        </Button>
      )
    })}
  </div>
)

