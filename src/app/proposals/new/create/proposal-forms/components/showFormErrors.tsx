import { showToast } from '@/shared/notification'

export function showFormErrors(formErrors: Record<string, { message?: string }>) {
  const errorMessages = Object.values(formErrors).map(error => error.message)

  showToast({
    severity: 'error',
    title: 'Form validation failed',
    content: (
      <div>
        <p className="mb-2">Please fix the following errors:</p>
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
