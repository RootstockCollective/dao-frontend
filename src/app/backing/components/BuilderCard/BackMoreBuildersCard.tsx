import { Button } from '@/components/ButtonNew'
import { BuildingBrick, CloseIconKoto } from '@/components/Icons'
import { Paragraph } from '@/components/TypographyNew'
import { cn } from '@/lib/utils'
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
      <div className="flex flex-col items-center">
        <div className="pb-[2rem]">
          <BuildingBrick color="none" />
        </div>
        <div className="pb-[1.5rem]">
          <Paragraph>
            {/* FIXME: Add the correct text here */}
            Backers back an average of 30 Builders, getting an average of 123 stRIF per cycle as rewards
          </Paragraph>
        </div>
        <Button variant="secondary-outline">Back more Builders</Button>
      </div>
    </div>
  )
}
