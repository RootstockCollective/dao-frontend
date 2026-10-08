import { EMPTY_STATE_ICON_COLOR, EMPTY_STATE_ICON_SIZE } from '@/components/EmptyState'
import { UsersIcon } from '@/components/Icons'

export const DelegationBannerIcon = () => (
  <UsersIcon
    size={EMPTY_STATE_ICON_SIZE}
    color={EMPTY_STATE_ICON_COLOR}
    strokeWidth={1.25}
    aria-hidden="true"
  />
)
