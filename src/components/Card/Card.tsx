import { FC } from 'react'
import { Paragraph } from '../Typography/Paragraph'
import { Header } from '../Typography/Header'
import { Label } from '../Typography'

interface Props {
  title: string
  content: string
  footer: string
}

export const Card: FC<Props> = ({ title, content, footer }) => (
  <div className="p-4 border border-white rounded-lg border-1">
    <Label variant='light' textClass='text-sm'>{title}</Label>
    <Paragraph>{content}</Paragraph>
    <Label variant='light' textClass='text-sm'>{footer}</Label>
  </div>
)
