import { Button } from '@/components/Button'

interface Props {
  onNext: () => void
  onExploreCommunities: () => void
}

export const GetStarted = ({ onNext, onExploreCommunities: exploreCommunities }: Props) => (
  <>
    <Button onClick={onNext} variant="white">
      Connect wallet
    </Button>
    <Button onClick={exploreCommunities} variant="outlined">
      Explore communities
    </Button>
  </>
)
