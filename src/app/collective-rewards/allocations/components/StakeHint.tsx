import { Link } from '@/components/Link'

export const StakeHint = () => (
  <span>
    Not enough stRIF to allocate. You can{' '}
    <Link href={'/user'} className="text-[#E56B1A]" target="_blank">
      Stake RIF
    </Link>{' '}
    to increase your balance
  </span>
)
