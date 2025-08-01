import { Paragraph } from '@/components/TypographyNew'

export const VotingPowerLoading = () => {
  return (
    <div className="flex justify-center items-center min-h-[200px]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <Paragraph>Checking voting power...</Paragraph>
      </div>
    </div>
  )
}
