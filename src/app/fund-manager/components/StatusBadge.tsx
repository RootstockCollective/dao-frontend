import { Span } from '@/components/Typography'
import { cn } from '@/lib/utils'

export type RequestStatus = 'Pending' | 'Cancelled'

const STATUS_STYLES: Record<RequestStatus, string> = {
  Pending: 'bg-brand-rootstock-purple text-foreground',
  Cancelled: 'bg-error text-foreground',
}

export const StatusBadge = ({ status }: { status: RequestStatus }) => (
  <div
    className={cn('inline-flex items-center justify-center rounded-full px-2 py-1 ', STATUS_STYLES[status])}
  >
    <Span variant="body-xs" className="whitespace-nowrap">
      {status}
    </Span>
  </div>
)
