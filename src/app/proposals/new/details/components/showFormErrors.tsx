import { Paragraph } from '@/components/TypographyNew'
import { showToast } from '@/shared/notification'

export function showFormErrors(formErrors: Record<string, { message?: string }>) {
  const errorMessages = Object.values(formErrors).map(error => error.message)

  showToast({
    severity: 'error',
    title: 'Form validation failed',
    content: (
      <div>
        <Paragraph className="mb-2">Please fix the following errors:</Paragraph>
        <ul className="list-disc list-inside space-y-1">
          {errorMessages.map((message, index) => (
            <li key={index} className="text-xs">
              {message}
            </li>
          ))}
        </ul>
      </div>
    ),
  })
}
