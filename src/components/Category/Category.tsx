import { cn } from '@/lib/utils/utils'
import { Paragraph } from '@/components/Typography'
import { FC, HTMLProps } from 'react'
import { CategoryType } from '@/components/Category/types'

interface Props extends HTMLProps<HTMLDivElement> {
  category: CategoryType
}

const parseDefaultLabel = (category: string) => {
  const label = category.charAt(0).toUpperCase() + category.slice(1)
  return label.replace('-', ' ')
}

const DEFAULT_CLASSES = 'text-white text-center w-[86px] h-[26px] rounded-[4px] p-[4px]'
export const Category: FC<Props> = ({ category = 'treasury', ...rest }) => {
  const classes = cn({
    [DEFAULT_CLASSES]: true,
    'bg-st-queue': category.toLowerCase() === 'treasury',
    'bg-st-info': category.toLowerCase() === 'builder',
    'bg-st-success': category.toLowerCase() === 'grants',
  })

  return (
    <div className={classes} {...rest}>
      <Paragraph variant="semibold" className="text-[12px]">
        {parseDefaultLabel(category)}
      </Paragraph>
    </div>
  )
}
