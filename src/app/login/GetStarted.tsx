import { Button } from '@/components/Button'
import { FC } from 'react'

interface Props {
  onNext: () => void
  onExploreCommunities: () => void
}

export const GetStarted: FC<Props> = ({ onNext, onExploreCommunities }) => (
  <>
    <Button onClick={onNext} variant="white">
      Connect wallet
    </Button>
    <Button onClick={onExploreCommunities} variant="outlined">
      Explore communities
    </Button>
  </>
)
