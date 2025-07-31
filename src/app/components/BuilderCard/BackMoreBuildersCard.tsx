import { Button } from '@/components/ButtonNew'
import { BuildingBrick, CloseIconKoto } from '@/components/Icons'
import { Paragraph } from '@/components/TypographyNew'
import { Typography } from '@/components/TypographyNew/Typography'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import { FC, useState } from 'react'

export interface BackMoreBuildersCardProps {
  dataTestId?: string
  topBarColor?: string
  className?: string
}

export const BackMoreBuildersCard: FC<BackMoreBuildersCardProps> = ({
  dataTestId,
  topBarColor,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(true)

  const router = useRouter()

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={cn(
        'rounded bg-v3-bg-accent-60 px-2 pb-6 flex flex-col items-center justify-center relative min-w-[200px] min-h-[554px]',
        className,
      )}
      data-testid={`builderCardContainer${dataTestId}`}
    >
      <div
        className="absolute top-0 left-0 w-full h-[8px] rounded-t"
        style={{ backgroundColor: topBarColor }}
        data-testid="backerMoreBuildersCard"
      />
      <button type="button" className="absolute top-0 right-0 -translate-x-5 translate-y-5">
        <CloseIconKoto size={24} onClick={() => setIsVisible(false)} />
      </button>
      <div className="flex flex-col items-center gap-8">
        <div className="">
          <BuildingBrick color="none" />
        </div>
        <Typography variant="h3" className="text-v3-text-100">
          Grow your impact
        </Typography>
        <Paragraph className="pb-2 text-center">
          Backing more Builders helps diversify your support across the ecosystem.
        </Paragraph>
        <Button onClick={() => router.push('/builders')} variant="secondary-outline">
          Back more Builders
        </Button>
      </div>
    </div>
  )
}
