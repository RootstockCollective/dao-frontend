'use client'

import { Button } from '@/components/Button'

// TODO(DAO-XXXX): Wire up cancel logic when the cancel request story is implemented
export function CancelRequestButton() {
  return (
    <Button variant="secondary-outline" data-testid="cancel-request-button" onClick={() => {}}>
      Cancel request
    </Button>
  )
}
