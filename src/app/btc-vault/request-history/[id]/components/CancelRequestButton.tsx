'use client'

import { Button } from '@/components/Button'

export function CancelRequestButton() {
  return (
    <Button variant="secondary-outline" data-testid="cancel-request-button" onClick={() => {}}>
      Cancel request
    </Button>
  )
}
