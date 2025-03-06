import { ReactNode } from 'react'
import { HeaderTitle, Typography } from '../Typography'

interface Props {
  name: string
  description: string | ReactNode
}

export const SectionHeader = ({ name, description }: Props) => {
  return (
    <div>
      <HeaderTitle>{name}</HeaderTitle>
      <Typography className="mt-4 text-[14px] max-w-[60%]">{description}</Typography>
    </div>
  )
}
