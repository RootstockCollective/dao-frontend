import { ReactNode } from 'react'
import { HeaderTitle, Paragraph } from '../Typography'

interface Props {
  name: string
  description: string | ReactNode
}

export const SectionHeader = ({ name, description }: Props) => {
  return (
    <>
      <HeaderTitle data-testid={`${name}Header`}>{name}</HeaderTitle>
      <Paragraph className="mb-6 w-[60%]" size="small" data-testid={`${name}Description`}>
        {description}
      </Paragraph>
    </>
  )
}
