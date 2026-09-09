import { Label } from '@/components/Typography'

export interface ReviewRowProps {
  label: string
  value: string
  testId: string
  subValue?: string
}

export const ReviewRow = ({ label, value, subValue, testId }: ReviewRowProps) => (
  <div className="flex justify-between items-start" data-testid={testId}>
    <Label variant="body-s" className="text-text-60">
      {label}
    </Label>
    <div className="flex flex-col items-end">
      <Label variant="body-s" bold>
        {value}
      </Label>
      {subValue && (
        <Label variant="body-s" className="text-text-40">
          {subValue}
        </Label>
      )}
    </div>
  </div>
)
